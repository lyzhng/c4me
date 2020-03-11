const mongoose = require('mongoose');

const CollegeSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description : {type: String},
    location :{
        city : String,
        state : String,
        zip : Number,
    },
    urls : {type: String},
    admission_rate : {type:String},
    cost : {
        in_state: Number,
        out_state : Number,
    },
    gpa: {type: String},
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
        AVG : Number,
    },
    act:{
        reading_25 : Number,
        reading_50 : Number,
        reading_75 : Number,
        writing_25 : Number,
        writing_50 : Number,
        writing_75 : Number,
        math_25 : Number,
        math_50 : Number,
        math_75 : Number,
        AVG: Number,
    },
    ranking : {type: Number}
});

const Colleges = mongoose.model("College",CollegeSchema);
module.exports = Colleges;