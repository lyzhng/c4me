const collections = require('../models');

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}

const searchCollege = function(query) {
  const college = collections.College;

  if (query === '') {
    return new Promise(function(resolve, reject) {
      college.find({}, function(err, collegeArr) {
        if (err) {
          console.log('error searching for colleges!');
        }
        resolve(collegeArr);
      });
    });
  } else {
    query = typeof(query) === 'string' ? query : '';
    let queryRegex = query.split(/ +/).filter((substr) => {
      return substr !== ''
      ;
    })
        .map((substr) => {
          return {name: {$regex: new RegExp(escapeRegExp(substr)), $options: 'i'}}
          ;
        });
    queryRegex = queryRegex.length !== 0 ? queryRegex : null;

    return new Promise(function(resolve, reject) {
      college.find({$and: queryRegex}, function(err, collegeArr) {
        resolve(collegeArr);
      });
    });
  }
};


module.exports = {
  searchCollege: searchCollege,
};
