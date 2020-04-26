const mongoose = require('mongoose');
const collections = require('../models');

mongoose.connect('mongodb://localhost/c4me', {useUnifiedTopology: true, useNewUrlParser: true});

const calculateSimilarHighschools = async (name, city, state) => {
  // holds our queried highschool
  const highschool = await collections.HighSchool.find({name, city, state});
  // holds all highschools
  const highschools = await collections.HighSchool.find({});
  return highschools;
};

module.exports = {
  calculateSimilarHighschools: calculateSimilarHighschools,
};
