const collections = require('../models');


const registerStudent = async (newUserid, password) => {
  return await collections.Student.find({userid: newUserid}).lean().then(async (resp) => {
    if (resp.length === 0) {
      return await collections.Student.create({userid: newUserid, password: password}); ;
    } else {
      throw new Error('userid or email already taken!');
    }
  });
};

// eslint-disable-next-line no-unused-vars
const login = async (userid, password, callback) => {

};

module.exports = {
  registerStudent: registerStudent,
};
