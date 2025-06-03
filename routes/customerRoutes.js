const express = require('express');
const router = express.Router();
const {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  bulkCreateCustomers
} = require('../controllers/customerController');
const { validateCustomer, validateBulkCustomers } = require('../middleware/validation');

router.post('/', validateCustomer, createCustomer);
router.post('/bulk', validateBulkCustomers, bulkCreateCustomers);
router.get('/', getAllCustomers);
router.get('/:id', getCustomerById);
router.put('/:id', validateCustomer, updateCustomer);
router.delete('/:id', deleteCustomer);

module.exports = router;