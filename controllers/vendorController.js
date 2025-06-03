const CommunicationLog = require('../models/CommunicationLog');
const { logger } = require('../utils/logger');

const deliveryReceipt = async (req, res) => {
  try {
    const { messageId, status, timestamp, failureReason } = req.body;

    // Find and update the communication log
    const logEntry = await CommunicationLog.findById(messageId);
    if (!logEntry) {
      return res.status(404).json({
        success: false,
        message: 'Message log not found'
      });
    }

    logEntry.status = status;
    logEntry.deliveryTimestamp = timestamp ? new Date(timestamp) : new Date();
    if (failureReason) {
      logEntry.failureReason = failureReason;
    }

    await logEntry.save();

    logger.info(`Delivery receipt processed: ${messageId} - ${status}`);
    res.json({
      success: true,
      message: 'Delivery receipt processed successfully'
    });
  } catch (error) {
    logger.error('Error processing delivery receipt:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing delivery receipt'
    });
  }
};

module.exports = {
  deliveryReceipt
};
