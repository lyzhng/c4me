const mongoose = require('mongoose');
const collections = require('../models');

mongoose.connect('mongodb://localhost/c4me', {useUnifiedTopology: true, useNewUrlParser: true});

// using highschool, we are trying to score highschool2
const calculateHSScore = (highschool, highschool2) => {
  return 1;
};

const calculateSimilarHighschools = async (name, city, state) => {
  // holds our queried highschool
  const highschool = await collections.HighSchool.find({name, city, state});
  // holds all highschools
  const highschools = await collections.HighSchool.find({});
  let scoredHighschools = [];
  for (let i = 0; i < highschools.length; i++) {
    const current = highschools[i];
    if (name == current.name && current.city == city && state == current.state) {
      continue;
    } else {
      const score = calculateHSScore(highschool, current);
      scoredHighschools.push({highschool: current, score});
    }
  }
  scoredHighschools.sort((a, b) => a.score - b.score).reverse();
  return scoredHighschools;
};

module.exports = {
  calculateSimilarHighschools: calculateSimilarHighschools,
};
