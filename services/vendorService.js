const axios = require('axios');
const { logger } = require('../utils/logger');

// Dummy Vendor API Service
const sendMessage = async (customer, message, logId, campaignId) => {
  try {
    // Simulate API delay
    setTimeout(async () => {
      try {
        // Simulate 90% success rate
        const isSuccess = Math.random() < 0.9;
        const status = isSuccess ? 'SENT' : 'FAILED';
        const failureReason = isSuccess ? null : 'Network timeout';

        // Call our own delivery receipt API
        const receiptData = {
          messageId: logId,
          status: status,
          timestamp: new Date().toISOString(),
          failureReason: failureReason
        };

        await axios.post(`${process.env.BASE_URL || 'http://localhost:5000'}/api/vendor/delivery-receipt`, receiptData);
        
        logger.info(`Message ${status.toLowerCase()}: ${customer.email} - Campaign: ${campaignId}`);
      } catch (error) {
        logger.error('Error in vendor API simulation:', error);
      }
    }, Math.random() * 3000 + 1000); // Random delay between 1-4 seconds

  } catch (error) {
    logger.error('Error initiating message send:', error);
  }
};

module.exports = {
  sendMessage
};