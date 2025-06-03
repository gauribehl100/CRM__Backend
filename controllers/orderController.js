const Order = require('../models/Order');
const Customer = require('../models/Customer');
const { logger } = require('../utils/logger');

const createOrder = async (req, res) => {
  try {
    // Verify customer exists
    const customer = await Customer.findById(req.body.customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const order = new Order(req.body);
    await order.save();
    
    logger.info(`Order created: ${order._id}`);
    res.status(201).json({
      success: true,
      data: order,
      message: 'Order created successfully'
    });
  } catch (error) {
    logger.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order'
    });
  }
};

const bulkCreateOrders = async (req, res) => {
  try {
    const { orders } = req.body;
    const createdOrders = [];
    const errors = [];

    for (let i = 0; i < orders.length; i++) {
      try {
        // Verify customer exists
        const customer = await Customer.findById(orders[i].customerId);
        if (!customer) {
          errors.push({
            index: i,
            order: orders[i],
            error: 'Customer not found'
          });
          continue;
        }

        const order = new Order(orders[i]);
        await order.save();
        createdOrders.push(order);
      } catch (error) {
        errors.push({
          index: i,
          order: orders[i],
          error: error.message
        });
      }
    }

    logger.info(`Bulk order creation: ${createdOrders.length} created, ${errors.length} failed`);
    res.status(201).json({
      success: true,
      data: {
        created: createdOrders,
        errors: errors,
        summary: {
          total: orders.length,
          created: createdOrders.length,
          failed: errors.length
        }
      },
      message: `${createdOrders.length} orders created successfully`
    });
  } catch (error) {
    logger.error('Error in bulk order creation:', error);
    res.status(500).json({
      success: false,
      message: 'Error in bulk order creation'
    });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find()
      .populate('customerId', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments();

    res.json({
      success: true,
      data: orders,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    logger.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders'
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('customerId');
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    logger.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order'
    });
  }
};

const updateOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('customerId');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    logger.info(`Order updated: ${order._id}`);
    res.json({
      success: true,
      data: order,
      message: 'Order updated successfully'
    });
  } catch (error) {
    logger.error('Error updating order:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order'
    });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    logger.info(`Order deleted: ${req.params.id}`);
    res.json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting order:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting order'
    });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  bulkCreateOrders
};