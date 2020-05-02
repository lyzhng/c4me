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

const calculateSimilarStudent = (student1, student2) => {
  let score = 0;

  score += ((student1.SAT_math === null) || (student2.SAT_math === null)) ? 0
  : ((Math.abs(student1.SAT_math - student2.SAT_math) <= 120) ? 1 : 0);

  score += ((student1.SAT_EBRW === null) || (student2.SAT_EBRW === null)) ? 0
  : ((Math.abs(student1.SAT_EBRW - student2.SAT_EBRW) <= 120) ? 1 : 0);

  score += ((student1.GPA === null) || (student2.GPA === null)) ? 0
  : ((Math.abs(student1.GPA - student2.GPA) <= .4) ? 1 : 0);

  score += ((student1.ACT_composite === null) || (student2.ACT_composite === null)) ? 0
  : ((Math.abs(student1.ACT_composite - student2.ACT_composite) <= 4) ? 1 : 0);

  return score >= 3 ? true : false; //if score is 3 or greater, we'll say that the two students are both similar academically

}

const studentsInCollege = (students, college) =>
{
  let foundStudents = [];
  for (let i = 0; i < students.length; i ++)
  {
    for (let p = 0; p < students[i].applications.length; p ++)
    {
      if (students[i].applications[p].college.toUpperCase() === college.name.toUpperCase())
      {
        foundStudents.push(students[i]);
        break;
      }
    }
  }
  return foundStudents;
}

const calculateCollegeScore = async (student) => {

  let scores = {};
  let similarStudents = [];
  //for storing the differences between student attributes and college attributes
  let gpaDiff = {};
  let satmathDiff = {};
  let satengDiff = {};
  let actDiff = {};
  let costDiff = {};
  let maxRank = 1;

  let allStudents = await collections.Student.find({});
  let allColleges = await collections.College.find();

  //find all similar students in the database
  for (let i = 0; i < allStudents.length; i ++)
  {
    if (calculateSimilarStudent(student, allStudents[i]) && (student.userid !== allStudents[i].userid))
    {
      similarStudents.push(allStudents[i]);
    }
  }

  //retrieve their applications
  allStudents = null;
  for (let i = 0; i < similarStudents.length; i ++)
  {
    await new Promise(function(resolve, reject)
    {
      similarStudents[i].populate({path: 'applications'}, function(err, populatedStudent)
      {
        resolve();
      });
    });
  }

  //calculate all differences
  for (let i = 0; i < allColleges.length; i++)
  {
    let college = allColleges[i];
    scores[college.name] = 0;

    maxRank = Math.max(maxRank, college.ranking);

    if (college.gpa !== -1) 
    {
      gpaDiff[college.name] = Math.abs(student.GPA - college.gpa);
    }
    else //if missing college gpa, set to null
    {
      gpaDiff[college.name] = null;
    }

    if (college.sat.math_avg !== -1) 
    {
      satmathDiff[college.name] = Math.abs(student.SAT_math - college.sat.math_avg);
    }
    else //if missing college sat math
    {
      satmathDiff[college.name] = null;
    }

    if (college.sat.EBRW_avg !== -1) 
    {
      satengDiff[college.name] = Math.abs(student.SAT_EBRW - college.sat.EBRW_avg);
    }
    else //if missing college sat eng
    {
      satengDiff[college.name] = null;
    }

    if (college.act.avg !== -1) 
    {
      actDiff[college.name] = Math.abs(student.ACT_composite - college.act.avg);
    }
    else //if missing college act composite
    {
      actDiff[college.name] = null;
    }

    if ( ((college.aid !== -1) || (college.rec_aid !== -1)) && (college.cost.attendance.in_state !== -1) && (college.cost.attendance.out_state !== -1))
    {
      let cost = student.residence_state 
      ? ( (student.residence_state.toUpperCase() === college.location.state.toUpperCase()) ? college.cost.attendance.in_state : college.cost.attendance.out_state) 
      : college.cost.attendance.out_state;

      cost -= student.income;
      cost -= Math.max(college.aid, (college.rec_aid / 100) * cost);

      costDiff[college.name] = cost < 0 ? 0 : cost;
    }
    else //missing cost / aid statistics
    {
      costDiff[college.name] = null;
    }
  }

  //calculate scores
  let maxGpaDiff = Math.max(...Object.values(gpaDiff));
  let maxSatmathDiff = Math.max(...Object.values(satmathDiff));
  let maxSatengDiff = Math.max(...Object.values(satengDiff));
  let maxActDiff = Math.max(...Object.values(actDiff));
  let maxCostDiff = Math.max(...Object.values(costDiff));

  for (let i = 0; i < allColleges.length; i++)
  {
    let college = allColleges[i];
    let students = studentsInCollege(similarStudents, college);

    scores[college.name] = {};
    scores[college.name].score = 0;
    scores[college.name].score += (college.ranking / maxRank); //ranking score
    scores[college.name].score += (gpaDiff[college.name] === null) ? 1 * 2.5 : (gpaDiff[college.name] / maxGpaDiff) * 2.5; //gpa score
    scores[college.name].score += (satmathDiff[college.name] === null) ? 1 * 2.5 : (satmathDiff[college.name] / maxSatmathDiff) * 2.5; //sat math score
    scores[college.name].score += (satengDiff[college.name] === null) ? 1 * 2.5 : (satengDiff[college.name] / maxSatengDiff) * 2.5; //sat eng score
    scores[college.name].score += (actDiff[college.name] === null) ? 1 * 2.5 : (actDiff[college.name] / maxActDiff) * 2.5; //act score
    scores[college.name].score += (costDiff[college.name] === null) ? 1 * 6 : (costDiff[college.name] / maxCostDiff) * 6; //cost score
    scores[college.name].score += similarStudents.length === 0 ? 1 * 3 : (1 - (students.length / similarStudents.length)) * 3; //similar students score
    
     scores[college.name].similarStudents = students;

    // scores[college.name].rankingScore = (college.ranking / maxRank);
    // scores[college.name].gpaScore = (gpaDiff[college.name] === null) ? 1 * 2.5 : (gpaDiff[college.name] / maxGpaDiff) * 2.5;
    // scores[college.name].satmathScore = (satmathDiff[college.name] === null) ? 1 * 2.5 : (satmathDiff[college.name] / maxSatmathDiff) * 2.5
    // scores[college.name].satengScore = (satengDiff[college.name] === null) ? 1 * 2.5 : (satengDiff[college.name] / maxSatengDiff) * 2.5;
    // scores[college.name].actScore = (actDiff[college.name] === null) ? 1 * 2.5 : (actDiff[college.name] / maxActDiff) * 2.5;
    // scores[college.name].costScore = (costDiff[college.name] === null) ? 1 * 6 : (costDiff[college.name] / maxCostDiff) * 6;
    // scores[college.name].similarScore = similarStudents.length === 0 ? 1 * 3 : (1 - (students.length / similarStudents.length)) * 3;



    //console.log(college.name);
    // console.log(college.ranking / maxRank);
    // console.log((gpaDiff[college.name] === null) ? 1 : (gpaDiff[college.name] / maxGpaDiff));
    // console.log((satmathDiff[college.name] === null) ? 1 : (gpaDiff[college.name] / maxSatmathDiff));
    // console.log((satengDiff[college.name] === null) ? 1 : (gpaDiff[college.name] / maxSatengDiff));
    // console.log((actDiff[college.name] === null) ? 1 : (gpaDiff[college.name] / maxActDiff));
    //console.log((costDiff[college.name] === null) ? 1 : (gpaDiff[college.name] / maxCostDiff) * 2.1);
    //console.log(similarStudents.length === 0 ? 1 : students.length / similarStudents.length);
    //console.log("_______________________________");


  }

  return scores;
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
  console.log(student);
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
        const ebrwQ1 = convertEBRW(
          college.sat.reading_25,
          college.sat.writing_25
        );
        const ebrwQ3 = convertEBRW(
          college.sat.reading_75,
          college.sat.writing_75
        );
        const mathQ1 = convertMath(college.sat.math_25);
        const mathQ3 = convertMath(college.sat.math_75);
        const questionableMath = isMathOutlier(
          mathQ1,
          mathQ3,
          student.SAT_math
        );
        const questionableEBRW = isEBRWOutlier(
          ebrwQ1,
          ebrwQ3,
          student.SAT_EBRW
        );
        console.log("Student EBRW", student.SAT_EBRW);
        console.log("EBRW Q1", ebrwQ1);
        console.log("EBRW Q3", ebrwQ3);
        console.log("Student Math", student.SAT_math);
        console.log("MATH Q1", mathQ1);
        console.log("MATH Q3", mathQ3);
        console.log("Is Questionable Math?", questionableMath);
        console.log("Is Questionable EBRW?", questionableEBRW);

        // not questionable at all
        if (!questionableMath && !questionableEBRW) {
          if (application.status === "accepted") {
            console.log(
              "Neither SAT scores are questionable and student was accepted."
            );
            return false;
          }
          if (application.status === "denied") {
            console.log(
              "Neither SAT scores are questionable and student was denied."
            );
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
        if (
          !questionableMath &&
          isAboveUpperBound(ebrwQ1, ebrwQ3, student.SAT_EBRW)
        ) {
          if (application.status === "accepted") {
            console.log(
              "Did normally on math but did really well in EBRW. Gets accepted."
            );
            return false;
          }
          if (application.status === "denied") {
            console.log(
              "Did normally on math but did really well in EBRW. Gets denied."
            );
            return true;
          }
        }

        if (
          !questionableMath &&
          isBelowLowerBound(ebrwQ1, ebrwQ3, student.SAT_EBRW)
        ) {
          if (application.status === "accepted") {
            console.log(
              "Did normally on math but did below in EBRW. Gets accepted."
            );
            return true;
            // debug
          }
          if (application.status === "denied") {
            console.log(
              "Did normally on math but did below in EBRW. Gets denied."
            );
            return false;
            // debug
          }
        }

        if (
          !questionableEBRW &&
          isAboveUpperBound(mathQ1, mathQ3, student.SAT_math)
        ) {
          if (application.status === "accepted") {
            console.log(
              "Did normally on EBRW but did really well in math. Gets accepted."
            );
            return false;
          }
          if (application.status === "denied") {
            console.log(
              "Did normally on EBRW but did really well in math. Gets denied."
            );
            return true;
          }
        }

        if (
          !questionableEBRW &&
          isBelowLowerBound(mathQ1, mathQ3, student.SAT_math)
        ) {
          if (application.status === "accepted") {
            console.log(
              "Did normally on EBRW but did below in math. Get accepted."
            );
            return true;
            // debug
          }
          if (application.status === "denied") {
            console.log(
              "Did normally on EBRW but did below in math. Get denied."
            );
            return false;
            // debug
          }
        }

        // questionable, only concerning really good and bad exam scores
        if (
          isAboveUpperBound(mathQ1, mathQ3, student.SAT_math) &&
          isAboveUpperBound(ebrwQ1, ebrwQ3, student.SAT_EBRW)
        ) {
          if (application.status === "denied") {
            console.log("Above and beyond in both SAT sections and denied.");
            return true;
          }
          if (application.status === "accepted") {
            console.log("Above and beyond in both SAT sections and accepted.");
            return false;
          }
        }

        if (
          isAboveUpperBound(mathQ1, mathQ3, student.SAT_math) &&
          isBelowLowerBound(ebrwQ1, ebrwQ3, student.SAT_EBRW)
        ) {
          if (application.status === "accepted") {
            console.log(
              "The student did really well in SAT Math but did below lower bound in EBRW."
            );
            return true;
          }
          if (application.status === "denied") {
            console.log(
              "The student did really well in SAT Math but did below lower bound in EBRW but got denied."
            );
            return false;
          }
        }

        if (
          isBelowLowerBound(mathQ1, mathQ3, student.SAT_math) &&
          isAboveUpperBound(ebrwQ1, ebrwQ3, student.SAT_EBRW)
        ) {
          if (application.status === "accepted") {
            console.log(
              "The student did really well in EBRW but did below lower bound in Math."
            );
            return true;
          }
          if (application.status === "denied") {
            console.log(
              "The student did really well in EBRW but did below lower bound in Math."
            );
            return false;
          }
        }

        if (
          isBelowLowerBound(ebrwQ1, ebrwQ3, student.SAT_EBRW) &&
          isBelowLowerBound(mathQ1, mathQ3, student.SAT_math)
        ) {
          if (application.status === "accepted") {
            console.log("Below and below, accepted.");
            return true;
          }
          if (application.status === "denied") {
            console.log("Below and below, denied.");
            return false;
          }
        }
        console.log(
          "Apparently did not fit any of those above, so default to questionable."
        );
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