const mongoose = require('mongoose');
const collections = require('../models');
const describe = require('mocha').describe;
const it = require('mocha').it;
const assert = require('chai').assert;
const { importCollegeRankings } = require('../backend/admin_handler');

describe('import college rankings', () => {
  before(async () => {
    mongoose.connect("mongodb://localhost/c4me", { useUnifiedTopology: true, useNewUrlParser: true });
    try {
      await collections.College.collection.drop();
    } catch (err) {
      console.log('cannot drop college database');
    }
  })
  it('should import college rankings from THE', async function () {
    this.timeout(0);
    await importCollegeRankings('./datasets/colleges.txt');
    const collegeCount = await collections.College.countDocuments({});
    assert.equal(collegeCount, 101);
    const colleges = await collections.College.find({});
    colleges.forEach((college) => {
      const { ranking } = college;
      console.log(college);
      assert.typeOf(ranking, 'number');
    });
  });
});

describe('import college descriptions', () => {
  before(async () => {
    mongoose.connect("mongodb://localhost/c4me", { useUnifiedTopology: true, useNewUrlParser: true });
    try {
      await collections.College.collection.drop();
    } catch (err) {
      console.log('cannot drop college database');
    }
  })
  it('should import college descriptions from THE', async function () {
    this.timeout(0);
    await importCollegeRankings('./datasets/colleges.txt');
    const collegeCount = await collections.College.countDocuments({});
    assert.equal(collegeCount, 101);
    const colleges = await collections.College.find({});
    colleges.forEach((college) => {
      const { description } = college;
      assert.typeOf(description, 'string');
      assert.notEqual(description, '');
    });
  });
})