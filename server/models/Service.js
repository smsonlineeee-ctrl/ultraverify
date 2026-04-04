const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  name: String,
  code: String,
  price: String
});

module.exports = mongoose.model('Service', ServiceSchema);