const mongoose = require("mongoose");

const HighschoolSchema = mongoose.Schema({
    name: String,
    location: String,
    similar_colleges_applied:[{type:String}],
    AP_enrollment: Number, //its actually a percentage e.g. a 96 would be 96%
    avg_SAT: Number,
    avg_ACT: Number,
    ranking: Number
});

const Highschool = mongoose.model("Highschool", HighschoolSchema);
module.exports = Highschool