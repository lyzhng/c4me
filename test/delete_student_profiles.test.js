const mongoose = require('mongoose');
const collections  = require('../models');
const describe = require('mocha').describe;
const it = require('mocha').it;
const assert = require('chai').assert;
const { deleteAllStudents } = require('../backend/admin_handler');


mongoose.connect("mongodb://localhost/c4me", { useUnifiedTopology: true, useNewUrlParser: true });

describe('delete student profiles', () => {
  beforeEach(async () => {
    await collections.Student.create({
      userid: 'jcool',
      password: 'joe$pass2',
    });
    await collections.Student.create({
      userid: 'bobby',
      password: 'bobbypassword',
    });
    await collections.Student.create({
      userid: 'pasta',
      password: 'pastapasta',
    });
    deleteAllStudents();
  });
  it('should drop the student collection database', async () => {
    const count = await collections.Student.count({});
    console.log(count);
    assert.equal(count, 0);
  });
});