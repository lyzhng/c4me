const collections = require('../models');
const adminHandler = require("./admin_handler");


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

const forEach = function (collection, callback, scope) {
  if (Object.prototype.toString.call(collection) === '[object Object]') {
    for (let prop in collection) {
      if (Object.prototype.hasOwnProperty.call(collection, prop)) {
        callback.call(scope, collection[prop], prop, collection);
      }
    }
  } else {
    for (let i = 0, len = collection.length; i < len; i++) {
      callback.call(scope, collection[i], i, collection);
    }
  }
};

const editStudentInfo = async (user) =>{
  const student = collections.Student.find({userid : user.userid});
  forEach(user, async function (value,prop,obj) {
    if (user[prop] !== null && student.find({[prop]:{"$exists":true}}) ){
      await collections.Student.update( {userid : user.userid},{"$set":obj},{ "upsert": true, "new": true});
      //console.log(student);
      //console.log(prop);
      //console.log(user[prop]);
    }
  });
};
const importStudentHS = async (user) =>{
  try{
    if (user.high_school_name === null || user.high_school_city === null || user.high_school_state === null)
      throw new Error("Missing High School Data");
    await adminHandler.importHighschoolData(user.high_school_name,user.high_school_city,user.high_school_state)
  }
  catch (e) {
    throw new Error("Invalid High School information");
  }
};

// eslint-disable-next-line no-unused-vars
const login = async (userid, password, callback) => {

};

module.exports = {
  importStudentHS: importStudentHS,
  editStudentInfo: editStudentInfo,
  registerStudent: registerStudent,
  getStudentProfile: getStudentProfile,
};
