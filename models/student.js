const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

Student.sat.math = 700; //my way
Student.SAT_MATH_1 = 700; // stoller

const StudentSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    userid: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    SAT_math: Number,
    SAT_ebrw: Number,
    SAT_literature: Number,
    SAT_math_I: Number,
    SAT_math_II: Number,
    SAT_US_hist: Number,
    SAT_world_hist: Number,
    SAT_eco_bio: Number,
    SAT_mol_bio: Number,
    ACT_English: Number,
    ACT_math: Number,
    ACT_reading: Number,
    ACT_composite: Number,
    location: String,
    major_1: String,
    major_2: String,
    college_class: Number,
    num_AP_passed: Number,
    high_school_city: String,
    high_school_sate: String,
    high_school_name: String,
    // applications:[{type: Schema.Types.ObjectId, ref:'Application'}],
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