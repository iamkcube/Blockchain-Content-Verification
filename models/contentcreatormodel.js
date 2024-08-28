const mongoose = require('mongoose');

const content_creator=mongoose.Schema({
  email: { type: String, required: true},
  username: { type: String, required: true,unique: true},
  password: { type: String, required: true },
})

const creator=mongoose.model('Creator',content_creator);
module.exports = creator;