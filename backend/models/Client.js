const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    required: true
  },
  name: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[\+]?[\d\s\-\(\)]{7,20}$/, 'Please enter a valid phone number (7-20 digits, can include spaces, dashes, and parentheses)']
  },
  email: {
    type: String,
    required: false,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  business_name: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true,
    maxlength: [200, 'Business name cannot exceed 200 characters']
  },
  business_description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Business description cannot exceed 1000 characters']
  },
  address: {
    type: String,
    trim: true,
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  pitch_status: {
    type: String,
    enum: ['Pending', 'To Be Pitched', 'Cancelled', 'Closed/Won', 'Lost'],
    default: 'Pending'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [2000, 'Notes cannot exceed 2000 characters']
  },
  tags: [{
    type: String,
    trim: true
  }],
  source: {
    type: String,
    enum: ['Referral', 'Website', 'Social Media', 'Cold Call', 'Trade Show', 'Other'],
    default: 'Other'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  assigned_to: {
    type: String,
    trim: true
  },
  last_contact: {
    type: Date,
    default: Date.now
  },
  next_follow_up: {
    type: Date
  },
  estimated_value: {
    type: Number,
    min: [0, 'Estimated value cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
// Make client email unique per user when email exists
clientSchema.index(
  { user: 1, email: 1 },
  { unique: true, partialFilterExpression: { email: { $exists: true, $type: 'string', $ne: '' } } }
);
clientSchema.index({ pitch_status: 1 });
clientSchema.index({ business_name: 'text', name: 'text' });
clientSchema.index({ createdAt: -1 });

// Virtual for full name
clientSchema.virtual('full_name').get(function() {
  return this.name;
});

// Pre-save middleware to update last_contact
clientSchema.pre('save', function(next) {
  this.last_contact = new Date();
  next();
});

// Static method to get clients by status
clientSchema.statics.getByStatus = function(status) {
  return this.find({ pitch_status: status });
};

// Instance method to update status
clientSchema.methods.updateStatus = function(newStatus) {
  this.pitch_status = newStatus;
  return this.save();
};

module.exports = mongoose.model('Client', clientSchema);
