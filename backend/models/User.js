const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  mobile: {
    type: String,
    required: true
  },
  pin: {
    type: String,
    required: true,
    unique: true,
    minlength: 12,
    maxlength: 12
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'banned'],
    default: 'active'
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
