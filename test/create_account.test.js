const mongoose = require('mongoose');
const collections = require('../models');
const assert = require('chai').assert;
const {registerStudent} = require('../backend/student_handler.js');

describe('create new account', function() {
  before(async () => {
    mongoose.connect('mongodb://localhost/c4me', {useUnifiedTopology: true, useNewUrlParser: true});
    try {
      await collections.Student.collection.drop();
    } catch (err) {
      console.log('cannot drop student database');
    }
  });
  after(() => {
    console.log('Finished testing account creation.');
  });
  it('should create a student with userid newStudent1', async function() {
    this.timeout(0);
    await registerStudent('newstudent1', 'password');
    const student = await collections.Student.find({userid: 'newstudent1'});
    assert.equal(student.length, 1);
  });
  it('should deny registration if userid is already taken', async function() {
    this.timeout(0);
    try {
      const response = await registerStudent('newstudent1', 'password');
      assert.equal(response, 'userid or email already taken!');
    } catch (err) {
      assert.equal(err.message, 'userid or email already taken!');
    }
  });
});
