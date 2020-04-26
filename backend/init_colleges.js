/* eslint-disable prefer-promise-reject-errors */
const mongoose = require('mongoose');
const college = require('../models').College;

const getCollegeNames = require('./get_college_names.js');

mongoose.connect('mongodb://localhost/c4me', {useUnifiedTopology: true, useNewUrlParser: true});

module.exports = function(filepath = '../datasets/colleges.txt') {
  return new Promise(function(resolve, reject) {
    college.find(async function(err, collegeArr) {
      if (err) {
        console.log('error with the database (init_colleges.js)');
        resolve();
      } else {
        if (collegeArr.length != 0) {
          console.log('colleges have already been initialized');
          resolve();
        } else {
          const collegeNames = await getCollegeNames(filepath);
          for (let i = 0; i < collegeNames.length; i ++) {
            let newCollege = {
              name: collegeNames[i],
              type: "",
              description: "",
              size: -1,
              location: {city: "", state: "", zip: ""},
              url: "",
              admission_rate: -1,
              cost: {attendance: {in_state: -1, out_state: -1}, tuition: {in_state: -1, out_state: -1}},
              grad_debt_mdn: -1,
              completion_rate: -1,
              gpa: -1,
              sat: {reading_25: -1, reading_50: -1, reading_75: -1, writing_25: -1, writing_50: -1, writing_75: -1, EBRW_avg: -1, math_25: -1, math_50: -1, math_75: -1, math_avg: -1, avg: -1},
              act: { english_25: -1, english_50: -1, english_75: -1, writing_25: -1, writing_50: -1, writing_75: -1, math_25: -1, math_50: -1, math_75: -1, composite_25: -1, composite_50: -1, composite_75: -1, avg: -1},
              majors: [],
              ranking: -1
            }
            await new Promise(function(resolve, reject) {
              college.create(newCollege, function(err) {
                if (err) {
                  console.error(err);
                  console.log('error with creating in the database (init_colleges.js)');
                  reject();
                } else {
                  console.log('created college: ' + collegeNames[i]);
                }
                resolve();
              });
            });
          }
          resolve();
        }
      }
    });
  });
};
