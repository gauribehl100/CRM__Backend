const Customer = require('../models/Customer');
const { logger } = require('../utils/logger');

const createCustomer = async (req, res) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    
    logger.info(`Customer created: ${customer._id}`);
    res.status(201).json({
      success: true,
      data: customer,
      message: 'Customer created successfully'
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Customer with this email already exists'
      });
    }
    logger.error('Error creating customer:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating customer'
    });
  }
};

const bulkCreateCustomers = async (req, res) => {
  try {
    const { customers } = req.body;
    const createdCustomers = [];
    const errors = [];

    for (let i = 0; i < customers.length; i++) {
      try {
        const customer = new Customer(customers[i]);
        await customer.save();
        createdCustomers.push(customer);
      } catch (error) {
        errors.push({
          index: i,
          customer: customers[i],
          error: error.message
        });
      }
    }

    logger.info(`Bulk customer creation: ${createdCustomers.length} created, ${errors.length} failed`);
    res.status(201).json({
      success: true,
      data: {
        created: createdCustomers,
        errors: errors,
        summary: {
          total: customers.length,
          created: createdCustomers.length,
          failed: errors.length
        }
      },
      message: `${createdCustomers.length} customers created successfully`
    });
  } catch (error) {
    logger.error('Error in bulk customer creation:', error);
    res.status(500).json({
      success: false,
      message: 'Error in bulk customer creation'
    });
  }
};

const getAllCustomers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const customers = await Customer.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Customer.countDocuments();

    res.json({
      success: true,
      data: customers,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    logger.error('Error fetching customers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customers'
    });
  }
};

const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    logger.error('Error fetching customer:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customer'
    });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    logger.info(`Customer updated: ${customer._id}`);
    res.json({
      success: true,
      data: customer,
      message: 'Customer updated successfully'
    });
  } catch (error) {
    logger.error('Error updating customer:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating customer'
    });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    logger.info(`Customer deleted: ${req.params.id}`);
    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting customer:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting customer'
    });
  }
};

module.exports = {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  bulkCreateCustomers
};
