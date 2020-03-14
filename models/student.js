const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const StudentSchema = new mongoose.Schema({
    userid: String,
    password: String,
    SAT_math: {type: Number, default: null},
    SAT_ebrw: {type: Number, default: null},
    SAT_literature: {type: Number, default: null},
    SAT_math_I: {type: Number, default: null},
    SAT_math_II: {type: Number, default: null},
    SAT_US_hist: {type: Number, default: null},
    SAT_world_hist: {type: Number, default: null},
    SAT_eco_bio: {type: Number, default: null},
    SAT_mol_bio: {type: Number, default: null},
    ACT_English: {type: Number, default: null},
    ACT_math: {type: Number, default: null},
    ACT_reading: {type: Number, default: null},
    ACT_composite: {type: Number, default: null},
    location: {type: String, default: null},
    major_1: {type: String, default: null},
    major_2: {type: String, default: null},
    college_class: {type: Number, default: null},
    num_AP_passed: {type: Number, default: null},
    high_school_city: {type: String, default: null},
    high_school_sate: {type: String, default: null},
    high_school_name: {type: String, default: null},
    applications:[{type: mongoose.Schema.ObjectId, ref:"Application", default:[]}],
  });

StudentSchema.pre('save', function(next) {
if (this.isNew || this.isModified('password')) {
    const document = this;
    bcrypt.hash(this.password, 5, function(err, hashedPassword) {
        if (err) {
            next(err);
        } else {
            document.password = hashedPassword;
            next();
        }
    });
    }
});

StudentSchema.methods.isCorrectPassword = function(password, callback) {
bcrypt.compare(password, this.password, function(err, same) {
    if (err) {
    callback(err);
    } else {
    callback(same);
    }
});
}

const Student = mongoose.model("Student", StudentSchema);
module.exports = Student;