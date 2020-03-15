const mongoose = require('mongoose');

const CollegeSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description : {type: String},
    location :{
        city : String,
        state : String,
        zip : Number,
    },
    url : {type: String},
    admission_rate : {type: Number},
    cost : {
        in_state: Number,
        out_state : Number,
    },
    gpa: {type: Number},
    sat:{
        reading_25 : Number,
        reading_50 : Number,
        reading_75 : Number,
        writing_25 : Number,
        writing_50 : Number,
        writing_75 : Number,
        math_25 : Number,
        math_50 : Number,
        math_75 : Number,
        avg : Number,
    },
    act:{
        english_25 : Number,
        english_50 : Number,
        english_75 : Number,
        writing_25 : Number,
        writing_50 : Number,
        writing_75 : Number,
        math_25 : Number,
        math_50 : Number,
        math_75 : Number,
        composite_25: Number,
        composite_50: Number,
        composite_75: Number,
        avg : Number,
    },
    ranking : {type: Number}
});

const College = mongoose.model("College",CollegeSchema);
module.exports = College;