const cheerio = require('cheerio');
const mongoose = require('mongoose');
const axios = require('axios');
const papa = require('papaparse');
const fs = require('fs');
const collections = require('../models');
const request = require("request");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const getCollegeNames = require('../backend/get_college_names');
const initCollege = require("./init_colleges.js");

mongoose.connect("mongodb://localhost/c4me", { useUnifiedTopology: true, useNewUrlParser: true });

const importStudentProfiles = (studentCsv) => {
	let studentData;
	let file = fs.readFileSync("../datasets/"+studentCsv,"utf-8")
	papa.parse(file,{
		header: true,
		dynamicTyping: true,
		complete: (results)=>{
			studentData = results.data;
			studentData = JSON.parse(JSON.stringify(studentData).replace(/\s(?=\w+":)/g, ""));
			studentData.forEach((student)=>{
				collections.Student.find({userid:student.userid}).lean().then((resp)=>{
					if(resp.length === 0)
						collections.Student.create(student).catch(err => { console.log(err); });
				});
			});
		}
	});
	//Converts json to a String version of json to use regex to remove all the whitespaces and then convert it back to json
};

//fill ranking / description field for each college in database
const importCollegeRankings = async function () {
	let college = collections.College;

	await initCollege(); //if no colleges in database, this will populate the database
	
	let url = "https://www.timeshighereducation.com/rankings/united-states/2020#!/page/0/length/-1/sort_by/rank/sort_order/asc/cols/stats";
	college.find(async function (err, collegeArr)
	{
		await new Promise(function(resolve, reject)
		{
			request(url, function(error, response, body)
			{
				if (error || response.statusCode !== 200)
				{
					console.log("failed to request ranking data!");
					reject();
				}
				else
				{
					const dom = new JSDOM(body, { resources: "usable", runScripts: "dangerously"});
					var nodelist = dom.window.document.querySelectorAll("div");
					console.log(nodelist);
					resolve();
				}
			});
		});
	});

};

const csvFilePath = '../datasets/college_scorecard.csv';

// { excel.csv: colleges.txt }
const remappedColleges = {
	'Franklin and Marshall College': 'Franklin & Marshall College',
	'Indiana University-Bloomington': 'Indiana University Bloomington',
	'The College of Saint Scholastica': 'The College of St Scholastica',
	'The University of Alabama': 'University of Alabama',
	'The University of Montana': 'University of Montana',
	'University of Massachusetts-Amherst': 'University of Massachusetts Amherst',
};

const importScorecardData = async function () {
	fs.readFile(csvFilePath, 'utf8', async (err, data) => {
		if (err) {
			console.log(err);
			return;
		}
		const colleges = [];
		const collegeNames = await getCollegeNames();
		// convert colleges.txt to excel.csv style to match with parser
		const collegesExcelStyle = collegeNames.map((college) => college.replace(', ', '-'));
		papa.parse(data, {
			worker: true,
			header: true,
			dynamicTyping: true,
			step: (row) => {
				let collegeName = row.data.INSTNM;
				// convert line-by-line excel.csv data to colleges.txt style
				if (collegeName in remappedColleges) {
					collegeName = remappedColleges[collegeName];
				}
				// compare with colleges.txt
				if (collegeName && collegesExcelStyle.includes(collegeName)) {
					const college = {};
					for (const column in row.data) {
						if (COLUMNS.includes(column)) {
							// convert back to colleges.txt naming style
							collegeName = collegeName.replace('-', ', ');
							college[column] = (column === 'INSTNM') ? collegeName : row.data[column];
						}
					}
					colleges.push(college);
				}
			},
			complete: (results) => {
				const scorecardData = JSON.parse(JSON.stringify(colleges));
				scorecardData.forEach((college) => {
					console.log(college);
					// collections.College.updateOne({ name: college.INSTNM }, {
					// });
				});
			}
		});
	});
}


module.exports = {
	importStudentProfiles: importStudentProfiles
};

importScorecardData();
// importStudentProfiles("students-1.csv");