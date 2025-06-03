const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Customer ID is required']
  },
  orderAmount: {
    type: Number,
    required: [true, 'Order amount is required'],
    min: [0, 'Order amount cannot be negative']
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  items: [{
    name: String,
    quantity: Number,
    price: Number
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Update customer stats after order save
orderSchema.post('save', async function() {
  try {
    const Customer = mongoose.model('Customer');
    const customerId = this.customerId;
    
    // Calculate total spend and visit count
    const orders = await mongoose.model('Order').find({ customerId });
    const totalSpend = orders.reduce((sum, order) => sum + order.orderAmount, 0);
    const visitCount = orders.length;
    const lastVisit = orders.length > 0 ? 
      Math.max(...orders.map(order => order.orderDate)) : 
      new Date();
    
    await Customer.findByIdAndUpdate(customerId, {
      totalSpend,
      visitCount,
      lastVisit
    });
  } catch (error) {
    console.error('Error updating customer stats:', error);
  }
});

module.exports = mongoose.model('Order', orderSchema);
