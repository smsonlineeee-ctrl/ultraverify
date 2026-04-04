const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  activeProvider: { type: String, enum: ['daisy', 'hero'], default: 'daisy' },
  exchangeRate: { type: Number, default: 1500 },
  topUpPercentage: { type: Number, default: 10 }
});

module.exports = mongoose.model('Settings', settingsSchema);
