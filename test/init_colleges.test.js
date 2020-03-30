const mongoose = require('mongoose');
const collections = require('../models');
const assert = require('chai').assert;
const initColleges = require('../backend/init_colleges');
const getCollegeNames = require('../backend/get_college_names');

describe('initialize colleges', () => {
  before(async () => {
    mongoose.connect('mongodb://localhost/c4me', {useUnifiedTopology: true, useNewUrlParser: true});
    await collections.College.deleteMany({});
  });
  it('should populate the database with all colleges in colleges.txt', async function() {
    this.timeout(0);
    const collegeCount = await collections.College.countDocuments({});
    assert.equal(collegeCount, 0);
    const colleges = await getCollegeNames('./datasets/colleges.txt');
    await initColleges('./datasets/colleges.txt');
    const finalCollegeCount = await collections.College.countDocuments({});
    assert.equal(finalCollegeCount, 101);
    colleges.forEach(async (college) => {
      const found = await collections.College.find({name: college}).lean();
      assert.notEqual(found, null);
      assert.notEqual(found, undefined);
    });
  });
})
;
