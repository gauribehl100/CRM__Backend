const express = require('express');
const router = express.Router();
const { deliveryReceipt } = require('../controllers/vendorController');

router.post('/delivery-receipt', deliveryReceipt);

module.exports = router;
