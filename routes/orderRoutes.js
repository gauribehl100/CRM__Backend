const express = require('express');
const router = express.Router();
const {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  bulkCreateOrders
} = require('../controllers/orderController');
const { validateOrder, validateBulkOrders } = require('../middleware/validation');

router.post('/', validateOrder, createOrder);
router.post('/bulk', validateBulkOrders, bulkCreateOrders);
router.get('/', getAllOrders);
router.get('/:id', getOrderById);
router.put('/:id', validateOrder, updateOrder);
router.delete('/:id', deleteOrder);

module.exports = router;