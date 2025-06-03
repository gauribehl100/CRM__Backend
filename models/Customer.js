const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  totalSpend: {
    type: Number,
    default: 0,
    min: 0
  },
  visitCount: {
    type: Number,
    default: 0,
    min: 0
  },
  lastVisit: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual field for days since last active
customerSchema.virtual('daysSinceLastActive').get(function() {
  const now = new Date();
  const lastVisit = this.lastVisit;
  const diffTime = Math.abs(now - lastVisit);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Update the updatedAt field before saving
customerSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Customer', customerSchema);
