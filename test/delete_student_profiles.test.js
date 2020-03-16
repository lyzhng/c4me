const mongoose = require('mongoose');
const collections  = require('../models');
const describe = require('mocha').describe;
const it = require('mocha').it;
const assert = require('chai').assert;
const { deleteAllStudents } = require('../backend/admin_handler');


mongoose.connect("mongodb://localhost/c4me", { useUnifiedTopology: true, useNewUrlParser: true });

describe('delete student profiles', () => {
  before(async () => {
    await addDummyApplications();
    await addDummyStudents();
    await deleteAllStudents();
  });
  it('should drop the student and application collections', async () => {
    const studentCount = await collections.Student.count({});
    const applicationCount = await collections.Application.count({});
    assert.equal(studentCount, 0);
    assert.equal(applicationCount, 0);
  });
});

async function addDummyStudents() {
  await collections.Student.create({
    userid: 'jcool',
    password: 'joe$pass2',
  });
  console.log('Added jcool');
  await collections.Student.create({
    userid: 'bobby',
    password: 'bobbypassword',
  });
  console.log('Added bobby');
  await collections.Student.create({
    userid: 'pasta',
    password: 'pastapasta',
  });
  console.log('Added pasta');
}

async function addDummyApplications() {
  await collections.Application.create({
    userid: 'bobby',
    college: 'Princeton University',
    status: 'Accepted',
  });
  console.log('Added bobby\'s application to Princeton University');
  await collections.Application.create({
    userid: 'jane',
    college: 'Carnegie Mellon University',
    status: 'Waitlisted',
  });
  console.log('Added jane\'s application to Carnegie Mellon University');
  await collections.Application.create({
    userid: 'wilson',
    college: 'Stony Brook University',
    status: 'Denied',
  });
  console.log('Added wilson\'s application to Stony Brook University');
}