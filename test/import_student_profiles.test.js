const mongoose = require('mongoose');
const collections = require('../models');
const assert = require('chai').assert;
const {importStudentProfiles} = require('../backend/admin_handler');

describe('import student profiles', () => {
  before(async () => {
    mongoose.connect('mongodb://localhost/c4me', {useUnifiedTopology: true, useNewUrlParser: true});
    try {
      await collections.Student.collection.drop();
      await collections.HighSchool.collection.drop();
      await collections.Application.collection.drop();
    } catch (err) {
      console.log('cannot drop student database');
    }
  });
  after(() => {
    console.log('Finished testing import student profiles.');
  });
  it('should have imported 3 students', async function() {
    this.timeout(0);
    await importStudentProfiles('students-1.csv', 'applications-1.csv');
    const studentCount = await collections.Student.find({});
    assert.equal(studentCount.length, 3);
  });
  it('should have imported 6 applications', async function() {
    this.timeout(0);
    const applicationCount = await collections.Application.find({});
    assert.equal(applicationCount.length, 6);
  });
  it('should have the correct number of applications for each student',
      async function() {
        this.timeout(0);
        const jcool = await collections.Student.findOne({userid: 'jcool'});
        const chuck = await collections.Student.findOne({userid: 'chuck'});
        const dummyStudent1 = await collections.Student.findOne({userid: 'dummystudent1'});
        assert.equal(jcool.applications.length, 2);
        assert.equal(chuck.applications.length, 2);
        assert.equal(dummyStudent1.applications.length, 2);
      });

  it('should have added 3 high schools', async function() {
    this.timeout(0);
    const highschoolCount = await collections.HighSchool.find({});
    assert.equal(highschoolCount.length, 3);
  });
});
