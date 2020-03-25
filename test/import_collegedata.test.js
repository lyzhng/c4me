const mongoose = require('mongoose');
const collections = require('../models');
//const describe = require('mocha').describe;
//const it = require('mocha').it;
const assert = require('chai').assert;
const { importCollegeData } = require('../backend/admin_handler');

describe('import college data', () => {
  before(async () => {
    mongoose.connect("mongodb://localhost/c4me", { useUnifiedTopology: true, useNewUrlParser: true });
    try {
      await collections.College.collection.drop();
    } catch (err) {
      console.log('cannot drop college database');
    }
  });
  it('should should have 101 colleges', async function () {
    await importCollegeData('./datasets/colleges.txt');
    const collegeCount = await collections.College.countDocuments({});
    assert.equal(collegeCount, 101);
  });
  it('should populate college sizes', async () => {
    const colleges = await collections.College.find({});
    colleges.forEach((college) => {
      const { size } = college;
      assert.typeOf(size, 'number');
      assert.isAtLeast(size, 0);
    });
  });
  it('should populate gpa', async () => {
    const colleges = await collections.College.find({});
    colleges.forEach((college) => {
      const { gpa } = college;
      assert.typeOf(gpa, 'number');
    });
  });
  it('should populate costs', async () => {
    const colleges = await collections.College.find({});
    colleges.forEach((college) => {
      const { cost } = college;
      assert.notTypeOf(cost, 'null');
      assert.notTypeOf(cost, 'undefined');
      assert.notTypeOf(cost.attendance, 'null');
      assert.notTypeOf(cost.attendance, 'undefined');
      assert.typeOf(cost.attendance.in_state, 'number');
      assert.typeOf(cost.attendance.out_state, 'number');
    });
  });
  it('should populate avg ACT', async () => {
    const colleges = await collections.College.find({});
    colleges.forEach((college) => {
      const { act, sat } = college;
      assert.notTypeOf(act, 'null');
      assert.notTypeOf(act, 'undefined');
      assert.typeOf(act.avg, 'number');
      assert.notTypeOf(sat, 'null');
      assert.notTypeOf(sat, 'undefined');
      assert.typeOf(sat.math_avg, 'number');
      assert.typeOf(sat.EBRW_avg, 'number');
    });
  });
})