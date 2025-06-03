const Campaign = require('../models/Campaign');
const Customer = require('../models/Customer');
const CommunicationLog = require('../models/CommunicationLog');
const { logger } = require('../utils/logger');
const { sendMessage } = require('../services/vendorService');
const { evaluateCustomerRules } = require('../utils/ruleEngine');

const createCampaign = async (req, res) => {
  try {
    // Calculate audience size
    const customers = await Customer.find();
    const matchingCustomers = customers.filter(customer => 
      evaluateCustomerRules(customer, req.body.rules)
    );

    const campaign = new Campaign({
      ...req.body,
      audienceSize: matchingCustomers.length
    });

    await campaign.save();

    // Start campaign delivery
    await initiateCampaignDelivery(campaign, matchingCustomers);

    logger.info(`Campaign created: ${campaign._id} with audience size: ${matchingCustomers.length}`);
    res.status(201).json({
      success: true,
      data: campaign,
      message: 'Campaign created and delivery initiated'
    });
  } catch (error) {
    logger.error('Error creating campaign:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating campaign'
    });
  }
};

const initiateCampaignDelivery = async (campaign, customers) => {
  try {
    for (const customer of customers) {
      const message = `Hi ${customer.name}, here's 10% off on your next order!`;
      
      // Create communication log entry
      const logEntry = new CommunicationLog({
        campaignId: campaign._id,
        customerId: customer._id,
        message: message,
        status: 'PENDING'
      });
      await logEntry.save();

      // Send message via vendor API (async)
      sendMessage(customer, message, logEntry._id, campaign._id);
    }
  } catch (error) {
    logger.error('Error initiating campaign delivery:', error);
  }
};

const getAudiencePreview = async (req, res) => {
  try {
    const { rules } = req.body;
    
    const customers = await Customer.find();
    const matchingCustomers = customers.filter(customer => 
      evaluateCustomerRules(customer, rules)
    );

    res.json({
      success: true,
      data: {
        audienceSize: matchingCustomers.length,
        totalCustomers: customers.length,
        matchRate: ((matchingCustomers.length / customers.length) * 100).toFixed(1)
      }
    });
  } catch (error) {
    logger.error('Error calculating audience preview:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating audience preview'
    });
  }
};

// const getAllCampaigns = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     const campaigns = await Campaign.find()
//       .skip(skip)
//       .limit(limit)
//       .sort({ createdAt: -1 });

//     const total = await Campaign.countDocuments();

//     res.json({
//       success: true,
//       data: campaigns,
//       pagination: {
//         current: page,
//         pages: Math.ceil(total / limit),
//         total
//       }
//     });
//   } catch (error) {
//     logger.error('Error fetching campaigns:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching campaigns'
//     });
//   }
// };


const getAllCampaigns = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Make sure to select all fields including audienceSize
    const campaigns = await Campaign.find()
      .select('+audienceSize') // Explicitly include audienceSize if it's not selected by default
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Campaign.countDocuments();

    // Debug log to check if audienceSize is present
    console.log('Campaigns being returned:', campaigns.map(c => ({
      id: c._id,
      name: c.name,
      audienceSize: c.audienceSize
    })));

    res.json({
      success: true,
      data: campaigns,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    logger.error('Error fetching campaigns:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching campaigns'
    });
  }
};

const getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    res.json({
      success: true,
      data: campaign
    });
  } catch (error) {
    logger.error('Error fetching campaign:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching campaign'
    });
  }
};

const getCampaignStats = async (req, res) => {
  try {
    const campaignId = req.params.id;
    
    const logs = await CommunicationLog.find({ campaignId });
    const sent = logs.filter(log => log.status === 'SENT').length;
    const failed = logs.filter(log => log.status === 'FAILED').length;
    const pending = logs.filter(log => log.status === 'PENDING').length;

    res.json({
      success: true,
      data: {
        total: logs.length,
        sent,
        failed,
        pending,
        successRate: logs.length > 0 ? ((sent / logs.length) * 100).toFixed(1) : 0
      }
    });
  } catch (error) {
    logger.error('Error fetching campaign stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching campaign stats'
    });
  }
};

const updateCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    logger.info(`Campaign updated: ${campaign._id}`);
    res.json({
      success: true,
      data: campaign,
      message: 'Campaign updated successfully'
    });
  } catch (error) {
    logger.error('Error updating campaign:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating campaign'
    });
  }
};

const deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndDelete(req.params.id);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Also delete associated communication logs
    await CommunicationLog.deleteMany({ campaignId: req.params.id });

    logger.info(`Campaign deleted: ${req.params.id}`);
    res.json({
      success: true,
      message: 'Campaign deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting campaign:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting campaign'
    });
  }
};

module.exports = {
  createCampaign,
  getAllCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  getAudiencePreview,
  getCampaignStats
};