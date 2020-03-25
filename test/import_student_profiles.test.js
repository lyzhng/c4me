const mongoose = require('mongoose');
const collections  = require('../models');
const describe = require('mocha').describe;
const it = require('mocha').it;
const assert = require('chai').assert;
const { importStudentProfiles } = require('../backend/admin_handler');


describe('import Student Profiles', function() {
	before(async () => {
    mongoose.connect("mongodb://localhost/c4me", { useUnifiedTopology: true, useNewUrlParser: true });
    try {
      await collections.Student.collection.drop();
    } catch (err) {
      console.log('cannot drop student database');
    }
	});
	
	it('should have imported 5 students', async function(){
		await importStudentProfiles("students-1.csv","applications-1.csv")
		let studentCount = await collections.Student.count({});
		assert.equal(studentCount, 5)
	});

	it('should have imported 7 applications', async function(){
		let studentCount = await collections.Student.count({});
		assert.equal(studentCount, 5)
	});

	it('should have added 4 high schools', async function(){
		let studentCount = await collections.Student.count({});
		assert.equal(studentCount, 5)
	});

});