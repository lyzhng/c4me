const mongoose = require('mongoose');
const collections = require('../models');
const describe = require('mocha').describe;
const it = require('mocha').it;
const assert = require('chai').assert;
const initColleges = require('../backend/init_colleges');
const getCollegeNames = require('../backend/get_college_names');

mongoose.connect("mongodb://localhost/c4me", { useUnifiedTopology: true, useNewUrlParser: true });

describe('initialize colleges', () => {
  before(async () => {
    await collections.College.remove({});
  });
  it('should populate the database with all colleges in colleges.txt', async () => {
    const colleges = await getCollegeNames();
    await initColleges();
    const collegeCount = await collections.College.countDocuments({});
    assert.equal(collegeCount, 101);
    colleges.forEach(async (college) => {
      const foundCollege = await collections.College.find({ name: college }).lean();
      assert.notEqual(foundCollege, null);
      assert.notEqual(foundCollege, undefined);
    });
  });
})