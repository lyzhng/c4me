const mongoose = require('mongoose');

const ApplicationSchema = mongoose.Schema({
	userid: String,
	college: String,
    status: String, //Denied, Pending, Accepted
    questionable: {type:Boolean, default:false}
});

const Application = mongoose.model("Application", ApplicationSchema);

module.exports = Application;