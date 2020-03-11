const cheerio = require('cheerio');
const mongoose = require('mongoose');
const axios = require('axios');
const papa = require('papaparse');
const fs = require('fs');
const collections = require('../models')

mongoose.connect("mongodb://localhost/c4me", { useUnifiedTopology: true, useNewUrlParser: true });

const importStudentProfiles = (studentCsv) => {
	var studentData;
	var file = fs.readFileSync("../datasets/"+studentCsv,"utf-8")
	papa.parse(file,{
		header: true,
		dynamicTyping: true,
		complete: (results)=>{
			studentData = results.data;
		}
	});
	//Converts json to a String version of json to use regex to remove all the whitespaces and then convert it back to json
	studentData = JSON.parse(JSON.stringify(studentData).replace(/\s(?=\w+":)/g, ""));
	
	studentData.forEach((student)=>{
		collections.Student.find({userid:student.userid}).lean().then((resp)=>{
			if(resp.length === 0)
				collections.Student.create(student).catch(err => { console.log(err); });
		});
	});
}

module.exports = {
	importStudentProfiles: importStudentProfiles
}