const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const StudentSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    sat:{type: Schema.Types.ObjectId, ref:'Sat'},
    act:{type: Schema.Types.ObjectId, ref:'Act'},
    applications:[{type: Schema.Types.ObjectId, ref:'Application'}],
    location:{type:String, default:""},
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

UserSchema.methods.isCorrectPassword = function(password, callback) {
bcrypt.compare(password, this.password, function(err, same) {
    if (err) {
    callback(err);
    } else {
    callback(err, same);
    }
});
}
const Student = mongoose.model("Student", StudentSchema);
module.exports = Student;