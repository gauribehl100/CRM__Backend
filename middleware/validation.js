const Joi = require('joi');

const customerSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    'string.empty': 'Customer name is required',
    'any.required': 'Customer name is required'
  }),
  email: Joi.string().email().lowercase().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  phone: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
    'string.pattern.base': 'Phone number must be 10 digits',
    'any.required': 'Phone number is required'
  }),
  totalSpend: Joi.number().min(0).default(0),
  visitCount: Joi.number().min(0).default(0),
  lastVisit: Joi.date().default(Date.now)
});

const orderSchema = Joi.object({
  customerId: Joi.string().required().messages({
    'any.required': 'Customer ID is required'
  }),
  orderAmount: Joi.number().min(0).required().messages({
    'number.min': 'Order amount cannot be negative',
    'any.required': 'Order amount is required'
  }),
  orderDate: Joi.date().default(Date.now),
  status: Joi.string().valid('pending', 'confirmed', 'shipped', 'delivered', 'cancelled').default('pending'),
  items: Joi.array().items(Joi.object({
    name: Joi.string(),
    quantity: Joi.number().min(1),
    price: Joi.number().min(0)
  }))
});

const campaignSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    'string.empty': 'Campaign name is required',
    'any.required': 'Campaign name is required'
  }),
  description: Joi.string().trim().allow(''),
  rules: Joi.array().items(Joi.object({
    field: Joi.string().valid('totalSpend', 'visitCount', 'daysSinceLastActive').required(),
    operator: Joi.string().valid('greater_than', 'less_than', 'equal_to', 'greater_equal', 'less_equal').required(),
    value: Joi.number().required(),
    logic: Joi.string().valid('AND', 'OR').default('AND')
  })).min(1).required().messages({
    'array.min': 'At least one rule is required'
  }),
  status: Joi.string().valid('draft', 'active', 'completed', 'paused').default('active')
});

const validateCustomer = (req, res, next) => {
  const { error } = customerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

const validateBulkCustomers = (req, res, next) => {
  const { customers } = req.body;
  
  if (!Array.isArray(customers) || customers.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Customers array is required and cannot be empty'
    });
  }

  for (let i = 0; i < customers.length; i++) {
    const { error } = customerSchema.validate(customers[i]);
    if (error) {
      return res.status(400).json({
        success: false,
        message: `Customer at index ${i}: ${error.details[0].message}`
      });
    }
  }
  
  next();
};

const validateOrder = (req, res, next) => {
  const { error } = orderSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

const validateBulkOrders = (req, res, next) => {
  const { orders } = req.body;
  
  if (!Array.isArray(orders) || orders.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Orders array is required and cannot be empty'
    });
  }

  for (let i = 0; i < orders.length; i++) {
    const { error } = orderSchema.validate(orders[i]);
    if (error) {
      return res.status(400).json({
        success: false,
        message: `Order at index ${i}: ${error.details[0].message}`
      });
    }
  }
  
  next();
};

const validateCampaign = (req, res, next) => {
  const { error } = campaignSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

module.exports = {
  validateCustomer,
  validateBulkCustomers,
  validateOrder,
  validateBulkOrders,
  validateCampaign
};
