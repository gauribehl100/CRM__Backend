const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Campaign name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  rules: [{
    field: {
      type: String,
      required: true,
      enum: ['totalSpend', 'visitCount', 'daysSinceLastActive']
    },
    operator: {
      type: String,
      required: true,
      enum: ['greater_than', 'less_than', 'equal_to', 'greater_equal', 'less_equal']
    },
    value: {
      type: Number,
      required: true
    },
    logic: {
      type: String,
      enum: ['AND', 'OR'],
      default: 'AND'
    }
  }],
  audienceSize: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'paused'],
    default: 'active'
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

campaignSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Campaign', campaignSchema);

