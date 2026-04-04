const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  displayName: { type: String, required: true },
  email:       { type: String, required: true, unique: true },
  phone:       { type: String, required: true },
  password:    { type: String, required: true },
  balance:     { type: Number, default: 0 },
  role:        { type: String, enum: ['user', 'admin'], default: 'user' },
  joinedAt:    { type: Date, default: Date.now },
  status:      { type: String, default: 'Active' },
  referral:    { type: String, default: null },
  pocketfi_customer_code: { type: String, default: null },
  virtual_account_number: { type: String, default: null },
  virtual_account_bank: { type: String, default: null },
  orders: { type: Array, default: [] },
  transactions: { type: Array, default: [] }
});

module.exports = mongoose.model('User', userSchema);
