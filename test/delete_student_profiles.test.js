const mongoose = require('mongoose');
const collections  = require('../models');
// const describe = require('mocha').describe;
// const it = require('mocha').it;
const assert = require('chai').assert;
const { deleteAllStudents } = require('../backend/admin_handler');

describe('delete student profiles', () => {
  before(async () => {
    mongoose.connect("mongodb://localhost/c4me", { useUnifiedTopology: true, useNewUrlParser: true });
    await addDummyApplications();
    await addDummyStudents();
  });
  it('should drop the student and application collections', async function() {
    this.timeout(0);
    await deleteAllStudents(); // also drops application collection
    const studentCount = await collections.Student.countDocuments({});
    const applicationCount = await collections.Application.countDocuments({});
    assert.equal(studentCount, 0);
    assert.equal(applicationCount, 0);
  });
  after(() => {
    console.log('I am done!');
  });
});

async function addDummyStudents() {
  const joe = createStudent('jcool', 'joe$pass2');
  await collections.Student.create(joe);
  const bobby = createStudent('bobby', 'bobbypassword');
  await collections.Student.create(bobby);
  const pasta = createStudent('pasta', 'pastapasta');
  await collections.Student.create(pasta);
  console.log('Added pasta');
}

async function addDummyApplications() {
  const bobby = createApplication('bobby', 'Princeton University', 'accepted');
  await collections.Application.create(bobby);
  const jane = createApplication('jane', 'Carnegie Mellon University', 'waitlisted');
  await collections.Application.create(jane);
  const wilson = createApplication('wilson', 'Stony Brook University', 'rejected');
  await collections.Application.create(wilson);
}

function createStudent(userid, password) {
  return {
    userid,
    password
  }
}

function createApplication(userid, college, status) {
  return {
    userid,
    college,
    status
  }
}