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
            await new Promise(function(resolve, reject) {
              college.create({name: collegeNames[i]}, function(err) {
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
