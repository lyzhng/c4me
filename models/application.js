const mongoose = require('mongoose');

const ApplicationSchema = mongoose.Schema({
	userid: String,
	college: String,
	status: String //Denied, Pending, Accepted
});

const Application = mongoose.model(ApplicationSchema);

module.exports = Application;