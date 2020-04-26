const mongoose = require('mongoose');
const {Schema} = mongoose;

const HighschoolSchema = new Schema({
  niche_id: {type: String, unique: true},
  name: String,
  city: String,
  state: String,
  similar_colleges_applied: [{type: String}],
  AP_enrollment: Number, // its actually a percentage e.g. a 96 would be 96%
  avg_SAT: Number,
  avg_ACT: Number,
  academic_ranking: String,
  college_prep_ranking: String,

});

const Highschool = mongoose.model('Highschool', HighschoolSchema);
module.exports = Highschool;
