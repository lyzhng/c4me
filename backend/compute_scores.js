const mongoose = require('mongoose');
const collections = require('../models');

mongoose.connect('mongodb://localhost/c4me', {useUnifiedTopology: true, useNewUrlParser: true});

const grades = { "A+": 8, "A": 7, "A-": 6, "B+": 5, "B": 4, "B-": 3, "C+": 2, "C": 1, "C-": 0};

/* using highschool, we are trying to score highschool2
Academics 50%, Ranking similarities 25%, College Interests 25%
*/

const calculateHSScore = (highschool, highschool2) => {
  let academics = 50 * 0;
  let ranking =
    12.5 *
      (1 -
        Math.abs(
          grades[highschool.academic_ranking] -
            grades[highschool2.academic_ranking]
        ) /
          8) +
    12.5 *
      (1 -
        Math.abs(
          grades[highschool.college_prep_ranking] -
            grades[highschool2.college_prep_ranking]
        ) /
          8);
  const simColleges = highschool.similar_colleges_applied.filter((college) => highschool2.similar_colleges_applied.includes(college));
  let colleges = 25 * simColleges.length * 0.1;
  return academics + colleges + ranking;
};

const calculateSimilarHighschools = async (name, city, state) => {
  // holds our queried highschool
  const highschool = await collections.HighSchool.find({ name, city, state });
  //highschool doesn't exist
  if (highschool.length < 1) {
    return []
  }
  // holds all highschools
  const highschools = await collections.HighSchool.find({});
  let scoredHighschools = [];
  for (let i = 0; i < highschools.length; i++) {
    const current = highschools[i];
    if (name == current.name && current.city == city && state == current.state) {
      continue;
    } else {
      const score = calculateHSScore(highschool[0], current);
      scoredHighschools.push({highschool: current, score});
    }
  }
  scoredHighschools.sort((a, b) => a.score - b.score).reverse();
  return scoredHighschools;
};

module.exports = {
  calculateSimilarHighschools: calculateSimilarHighschools,
};
