const mongoose = require('mongoose');
const collections = require('../models');
const {ebrwTable, mathTable} = require('./converter');
mongoose.connect('mongodb://localhost/c4me', {useUnifiedTopology: true, useNewUrlParser: true});

const grades = {'A+': 8, 'A': 7, 'A-': 6, 'B+': 5, 'B': 4, 'B-': 3, 'C+': 2, 'C': 1, 'C-': 0};

/* using highschool, we are trying to score highschool2
Academics 50%, Ranking similarities 25%, College Interests 25%
*/

const calculateHSScore = (highschool, highschool2) => {
  const sat = 20 * (1 - Math.abs(highschool.avg_SAT / 1600 - highschool2.avg_SAT / 1600));
  const act = 20 * (1 - Math.abs(highschool.avg_ACT / 36 - highschool2.avg_ACT / 36));
  const aps = 10 * (1 - Math.abs(highschool.AP_enrollment / 100 - highschool2.AP_enrollment / 100));
  const ranking =
    12.5 *
      (1 -
        Math.abs(
            grades[highschool.academic_ranking] -
            grades[highschool2.academic_ranking],
        ) /
          8) +
    12.5 *
      (1 -
        Math.abs(
            grades[highschool.college_prep_ranking] -
            grades[highschool2.college_prep_ranking],
        ) /
          8);
  const simColleges = highschool.similar_colleges_applied.filter((college) => highschool2.similar_colleges_applied.includes(college));
  const colleges = 25 * simColleges.length * 0.1;
  return sat + act + aps + colleges + ranking;
};

const calculateSimilarHighschools = async (name, city, state) => {
  // holds our queried highschool
  const highschool = await collections.HighSchool.find({name, city, state});
  // highschool doesn't exist
  if (highschool.length < 1) {
    return [];
  }
  // holds all highschools
  const highschools = await collections.HighSchool.find({});
  const scoredHighschools = [];
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

const calculateCollegeScore = async (student) => {
  const scoreMap = {};
  const allColleges = await collections.College.find();
  for (let i = 0; i < allColleges.length; i ++) {
    scoreMap[allColleges[i].name] = Math.floor(Math.random() * allColleges.length);
  }
  return scoreMap;
};

async function isQuestionableApplication(name, student, _id) {
  const college = await collections.College.findOne({name}).lean();
  if (college === null) {
    throw new Error(`${name} cannot be found in the database.`);
  }
  console.log('The college that is being tested is', college.name);
  const application = await collections.Application.findOne({_id}).lean();
  let questionableSAT = null;
  let questionableACT = null;
  try {
    questionableSAT = isQuestionableSAT(college, student, application);
    console.log('Questionable SAT?', questionableSAT);
  } catch (err) {
    console.error(err.message);
  }
  try {
    questionableACT = isQuestionableACT(college, student, application);
    console.log('Questionable ACT?', questionableACT);
  } catch (err) {
    console.error(err.message);
  }
  let isQuestionable = false;
  if (questionableSAT === null && questionableACT === null) {
    isQuestionable = false;
  } else if (questionableSAT !== null && questionableACT === null) {
    isQuestionable = questionableSAT;
  } else if (questionableSAT === null && questionableACT !== null) {
    isQuestionable = questionableACT;
  } else if (questionableSAT !== null && questionableACT !== null) {
    isQuestionable = questionableACT || questionableSAT;
  }
  await collections.Application.updateOne({ _id }, {
    questionable: isQuestionable
  });
  const debugging = await collections.Application.findOne({_id});
  console.log(`${debugging.college}: ${debugging.questionable}`);
};

function isQuestionableACT(college, student, application) {
  // doesn't concern the algorithm
  if (application.status !== 'accepted' && application.status !== 'denied') {
    console.log('Application status is neither accepted nor denied.');
    return false;
  }
  if (actScoresDontExist(college, student)) {
    throw new Error(`Required ACT scores do not exist for ${college.name}.`);
  }
  const studentACT = student.ACT_composite;
  const lower = lowerBound(college.act.composite_25, college.act.composite_75);
  const upper = upperBound(college.act.composite_25, college.act.composite_75);
  const isAcceptedButLowScores = (lower > studentACT) && application.status === 'accepted';
  const isDeniedButHighScores = (studentACT > upper) && application.status === 'denied';
  console.log('Accepted But Low Scores?', isAcceptedButLowScores);
  console.log('Rejected But High Scores?', isDeniedButHighScores);
  return isAcceptedButLowScores || isDeniedButHighScores;
};

function isQuestionableSAT(college, student, application) {
  // doesn't concern the algorithm
  if (application.status !== 'accepted' && application.status !== 'denied') {
    console.log('Application status is neither accepted nor denied.');
    return false;
  }
  if (satScoresDontExist(college, student)) {
    throw new Error(`Required SAT scores do not exist for ${college.name}.`);
  }
  try {
    const ebrwQ1 = convertEBRW(college.sat.reading_25, college.sat.writing_25);
    const ebrwQ3 = convertEBRW(college.sat.reading_75, college.sat.writing_75);
    const mathQ1 = convertMath(college.sat.math_25);
    const mathQ3 = convertMath(college.sat.math_75);
    const questionableMath = isMathOutlier(mathQ1, mathQ3, student.SAT_math);
    const questionableEBRW = isEBRWOutlier(ebrwQ1, ebrwQ3, student.SAT_EBRW);
    console.log('Student EBRW', student.SAT_EBRW);
    console.log('EBRW Q1', ebrwQ1);
    console.log('EBRW Q3', ebrwQ3);
    console.log('Student Math', student.SAT_math);
    console.log('MATH Q1', mathQ1);
    console.log('MATH Q3', mathQ3);
    console.log('Is Questionable Math?', questionableMath);
    console.log('Is Questionable EBRW?', questionableEBRW);

    // not questionable at all
    if (!questionableMath && !questionableEBRW) {
      if (application.status === 'accepted') {
        console.log('Neither SAT scores are questionable and student was accepted.');
        return false;
      }
      if (application.status === 'denied') {
        console.log('Neither SAT scores are questionable and student was denied.');
        return false;
      }
    }

    // if (questionableMath && questionableEBRW) {
    //   if (application.status === 'accepted') {
    //     console.log('Both SAT and EBRW are questionable but was accepted.');
    //     return true;
    //   }
    //   if (application.status === 'denied') {
    //     console.log('Both SAT and EBRW are questionable but was denied.');
    //     return
    //   }
    // }

    // do normal range in one and do bad/good in the other
    if (!questionableMath && isAboveUpperBound(ebrwQ1, ebrwQ3, student.SAT_EBRW)) {
      if (application.status === 'accepted') {
        console.log('Did normally on math but did really well in EBRW. Gets accepted.');
        return true;
      }
      if (application.status === 'denied') {
        console.log('Did normally on math but did really well in EBRW. Gets denied.');
        return false;
      }
    }

    if (!questionableMath && isBelowLowerBound(ebrwQ1, ebrwQ3, student.SAT_EBRW)) {
      if (application.status === 'accepted') {
        console.log('Did normally on math but did below in EBRW. Gets accepted.');
        return true;
        // debug
      }
      if (application.status === 'denied') {
        console.log('Did normally on math but did below in EBRW. Gets denied.');
        return false;
        // debug
      }
    }

    if (!questionableEBRW && isAboveUpperBound(mathQ1, mathQ3, student.SAT_math)) {
      if (application.status === 'accepted') {
        console.log('Did normally on EBRW but did really well in math. Gets accepted.');
        return false;
      }
      if (application.status === 'denied') {
        console.log('Did normally on EBRW but did really well in math. Gets denied.');
        return true;
      }
    }

    if (!questionableEBRW && isBelowLowerBound(mathQ1, mathQ3, student.SAT_math)) {
      if (application.status === 'accepted') {
        console.log('Did normally on EBRW but did below in math. Get accepted.');
        return true;
        // debug
      }
      if (application.status === 'denied') {
        console.log('Did normally on EBRW but did below in math. Get denied.');
        return false;
        // debug
      }
    }

    // questionable, only concerning really good and bad exam scores
    if (isAboveUpperBound(mathQ1, mathQ3, student.SAT_math) && isAboveUpperBound(ebrwQ1, ebrwQ3, student.SAT_EBRW)) {
      if (application.status === 'denied') {
        console.log('Above and beyond in both SAT sections and denied.');
        return true;
      }
      if (application.status === 'accepted') {
        console.log('Above and beyond in both SAT sections and accepted.');
        return false;
      }
    }

    if (isAboveUpperBound(mathQ1, mathQ3, student.SAT_math) && isBelowLowerBound(ebrwQ1, ebrwQ3, student.SAT_EBRW)) {
      if (application.status === 'accepted') {
        console.log('The student did really well in SAT Math but did below lower bound in EBRW.');
        return false;
      }
      if (application.status === 'denied') {
        console.log('The student did really well in SAT Math but did below lower bound in EBRW but got denied.');
        return true;
      }
    }

    if (isBelowLowerBound(mathQ1, mathQ3, student.SAT_math) && isAboveUpperBound(ebrwQ1, ebrwQ3, student.SAT_EBRW)) {
      if (application.status === 'accepted') {
        console.log('The student did really well in EBRW but did below lower bound in Math.');
        return false;
      }
      if (application.status === 'denied') {
        console.log('The student did really well in EBRW but did below lower bound in Math.');
        return false;
      }
    }

    if (isBelowLowerBound(ebrwQ1, ebrwQ3, student.SAT_EBRW) && isBelowLowerBound(mathQ1, mathQ3, student.SAT_math)) {
      if (application.status === 'accepted') {
        console.log('Below and below, accepted.');
        return true;
      }
      if (application.status === 'denied') {
        console.log('Below and below, denied.');
        return false;
      }
    }
    console.log('Apparently did not fit any of those above, so default to questionable.');
    return true;
  } catch (err) {
    console.log(err);
  }
}

function isMathOutlier(Q1, Q3, score) {
  return isAboveUpperBound(Q1, Q3, score) || isBelowLowerBound(Q1, Q3, score);
};

function isEBRWOutlier(Q1, Q3, score) {
  return isAboveUpperBound(Q1, Q3, score) || isBelowLowerBound(Q1, Q3, score);
};

const convertEBRW = (readingScore, writingScore) => {
  console.log('Reading Score', readingScore);
  console.log('Writing Score', writingScore);
  return String(readingScore + writingScore) in ebrwTable ?
    ebrwTable[readingScore + writingScore] :
    new Error('No such score in EBRW table.');
};
const convertMath = (oldMathScore) => {
  console.log('Math Score', oldMathScore);
  return String(oldMathScore) in mathTable ?
    mathTable[oldMathScore] :
    new Error('No such score in Math table');
};
const isAboveUpperBound = (Q1, Q3, score) => score > upperBound(Q1, Q3);
const isBelowLowerBound = (Q1, Q3, score) => lowerBound(Q1, Q3) > score;
const lowerBound = (Q1, Q3) => Q1 - (1.5 * (Q3 - Q1));
const upperBound = (Q1, Q3) => Q3 + (1.5 * (Q3 - Q1));
const satScoresDontExist = (college, student) => {
  return (
    college.sat.reading_25 === -1 ||
    college.sat.writing_25 === -1 ||
    college.sat.reading_75 === -1 ||
    college.sat.writing_75 === -1 ||
    college.sat.math_25 === -1 ||
    college.sat.math_75 === -1 ||
    student.SAT_math === -1 ||
    student.SAT_EBRW === -1 ||
    student.SAT_math === null ||
    student.SAT_EBRW === null
  );
};

const actScoresDontExist = (college, student) => {
  return (
    college.act.composite_25 === -1 ||
    college.act.composite_75 === -1 ||
    student.ACT_composite === -1 ||
    student.ACT_composite === null
  );
};

module.exports = {
  calculateSimilarHighschools: calculateSimilarHighschools,
  calculateCollegeScore: calculateCollegeScore,
  isQuestionableApplication,
};
