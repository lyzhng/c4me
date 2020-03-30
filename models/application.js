const mongoose = require('mongoose');
const {Schema} = mongoose;

const ApplicationSchema = new Schema({
  userid: String,
  college: String,
  status: String, // Denied, Pending, Accepted
  questionable: {type: Boolean, default: false},
});

const Application = mongoose.model('Application', ApplicationSchema);

module.exports = Application;
