const mongoose = require('mongoose');
const collections  = require('../models');
// const describe = require('mocha').describe;
// const it = require('mocha').it;
const assert = require('chai').assert;
const { importStudentProfiles } = require('../backend/admin_handler');


describe('import Student Profiles', () => {
	before(async () => {
    mongoose.connect("mongodb://localhost/c4me", { useUnifiedTopology: true, useNewUrlParser: true });
    try {
	  await collections.Student.collection.drop();
	  await collections.HighSchool.collection.drop();
	  await collections.Application.collection.drop();
	  
    } catch (err) {
      console.log('cannot drop student database');
    }
	});
	
	it('should have imported 3 students', async function(){
		await importStudentProfiles("students-1.csv","applications-1.csv");
		let studentCount = await collections.Student.find({});
		assert.equal(studentCount.length, 3);
	});

	it('should have imported 6 applications', async () => {
		let applicationCount = await collections.Application.find({});
		assert.equal(applicationCount.length, 6);
	});

	it('should have the correct number of applications for each student', async () => {
		let jcool = await collections.Student.findOne({userid:"jcool"});
		let chuck = await collections.Student.findOne({userid:"chuck"});
		let dummyStudent1 = await collections.Student.findOne({userid:"dummystudent1"});
		assert.equal(jcool.applications.length, 2);
		assert.equal(chuck.applications.length, 2);
		assert.equal(dummyStudent1.applications.length, 2);
	});

	it('should have added 3 high schools', async () => {
		let highschoolCount = await collections.HighSchool.find({});
		assert.equal(highschoolCount.length, 3);
	});

	after(() => {
		console.log("Finished testing import student profiles.");
	});
}); 