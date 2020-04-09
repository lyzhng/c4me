const collections = require('../models');


const registerStudent = async (newUserid, password) => {
  const resp = await collections.Student.find({ userid: newUserid }).lean();
  if (resp.length === 0) {
    return await collections.Student.create({userid: newUserid, password: password});
  } else {
    throw new Error('userid or email already taken!');
  }
};

const getStudentProfile = async (userId) => {
  const results = await collections.Student.find({userid: userId}).lean();
  if (results.length === 0) {
    throw new Error('no such user!');
  }
  return results[0];
};

// eslint-disable-next-line no-unused-vars
const login = async (userid, password, callback) => {

};

module.exports = {
  registerStudent: registerStudent,
  getStudentProfile: getStudentProfile,
};
