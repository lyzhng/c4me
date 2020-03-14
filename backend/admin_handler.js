const cheerio = require('cheerio');
const mongoose = require('mongoose');
const axios = require('axios');
const Papa = require('papaparse');
const fs = require('fs');
const collections = require('../models');
const request = require("request");
const puppeteer = require('puppeteer');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const getCollegeNames = require('../backend/get_college_names');
const initCollege = require("./init_colleges.js");

mongoose.connect("mongodb://localhost/c4me", { useUnifiedTopology: true, useNewUrlParser: true });

//import student profile csv and takes in name of csv file
const importStudentProfiles = (studentCsv) => {
	let studentData;
	let file = fs.readFileSync("../datasets/"+studentCsv,"utf-8")
	Papa.parse(file,{
		header: true,
		dynamicTyping: true,
		complete: (results)=>{
			studentData = results.data;
			studentData = JSON.parse(JSON.stringify(studentData).replace(/\s(?=\w+":)/g, ""));
	
			const studentsInsert =studentData.map((student)=>{
					collections.Student.find({userid:student.userid}).lean().then((resp)=>{
						if(resp.length === 0)
						{
							collections.Student.create(student).then((resp)=>{
								console.log("Created", resp);
							}).catch(err => { console.log(err); });
						}
					});
				});
			Promise.all(studentsInsert).then(()=>{
				importApplicationData("applications-1.csv");
			})		
		}
	});
	//Converts json to a String version of json to use regex to remove all the whitespaces and then convert it back to json
};

//imports application csv and takes in string containing name of csv
const importApplicationData = (applicationCSV) =>{
	let applicationData;
	let file = fs.readFileSync("../datasets/"+applicationCSV, "utf-8");
	Papa.parse(file, {
		header: true,
		dynamicTyping: true,
		complete: (results) => {
			applicationData = results.data;
			applicationData.forEach((newApp, index) =>{
				collections.Student.findOne({userid: newApp.userid}, "userid, applications").then((resp) =>{
					if(resp){
						//checks for duplicated applications by checking the array length of the duplicate array
						let duplicate = resp.applications.filter((app)=>{return app.college === newApp.college});
						if(duplicate.length === 0){
							collections.Student.updateOne({userid: newApp.userid}, {$push:{applications:{college:newApp.college, status:newApp.status}}}).then((resp)=>{
								console.log("Added application for "+ newApp.userid+" with college: "+newApp.college+" and status:"+newApp.status);
							})
						}
					}
				});
			});
		}
	});
};

//fill ranking / description field for each college in database
const importCollegeRankings = async function () {
	let college = collections.College;

	await initCollege(); //if no colleges in database, this will populate the database
	
	let allRankingsUrl = "https://www.timeshighereducation.com/rankings/united-states/2020#!/page/0/length/-1/sort_by/rank/sort_order/asc/cols/stats";
	
	college.find(async function (err, collegeArr)
	{
		let allRankings;
		await new Promise(async function(resolve, reject)
		{
			let browser = await puppeteer.launch();
			let page = await browser.newPage();

			await page.goto(allRankingsUrl);
			allRankings = await page.evaluate(() =>
			{
				let collegeNames = {};
				let rankings = document.querySelectorAll("a.ranking-institution-title");
				for (let i = 0; i < rankings.length; i ++)
				{
					collegeNames[rankings[i].textContent] = i + 1;
				}
				return collegeNames;
			});
			browser.close();

			resolve();
		});

		for (let i = 0; i < collegeArr.length; i ++)
		{
			if (allRankings[collegeArr[i].name] === null)
			{
				console.log("could not pull ranking for " + collegeArr[i].name);
			}
			else
			{
				collegeArr[i].ranking = allRankings[collegeArr[i].name];
				collegeArr[i].save();
				console.log("updated ranking for " + collegeArr[i].name + ": " + allRankings[collegeArr[i].name]);
			}
		}
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
};

const importCollegeGPA = async function () {
	let college = collections.College;
	let collegeName = await getCollegeNames();
	let collegeUrl;
	// let gpa_data = new Map();
	for (let i = 0; i < collegeName.length; i++){
		collegeUrl = collegeName[i];
		if (remapped_names.has(collegeName[i])){
			console.log(remapped_names.get(collegeName[i]));
			collegeUrl = remapped_names.get(collegeName[i]);
		}
		let regex = /\b(The)\s\b/gi;
		collegeUrl = collegeUrl.replace(regex,'');
		collegeUrl = collegeUrl.replace(/,|&/g, '');
		collegeUrl = collegeUrl.replace(/\s+/g, '-');
		await new Promise(function(resolve, reject)
		{
			request({
				method: "GET",
				url: 'https://www.collegedata.com/college/' + collegeUrl,
			},(err,res,body)=>{
				if (err || res.statusCode !== 200)
				{
					console.log("failed to request ranking data!");
					reject();
				}
				else
				{
					let $ = cheerio.load(body);
					let dt_tags = $("dt").map(function() {
						return $(this).text();
					}).get();
					let dd_tags = $("dd").map(function() {
						return $(this).text();
					}).get();
					// let dd_tags = overview.find('dl').find('dd');
					let GPA;
					let AVG_ACT;
					for (let j=0; j < dt_tags.length; j++){
						if (dt_tags[j] === "Average GPA"){
							GPA = dd_tags[j];
						}
						if (dt_tags[j] === ("ACT Composite")){
							AVG_ACT = dd_tags[j];
						}
					}
					college[collegeName].gpa = GPA;
					college[collegeName].act.avg = AVG_ACT;
					college[collegeName].save();
					resolve();
				}
			})
		});
	}
};

let remapped_names = new Map();
remapped_names.set('Franklin and Marshall College', 'Franklin Marshall College');
remapped_names.set('SUNY College of Environmental Science and Forestry', 'State University of New York College of Environmental Science and Forestry');
remapped_names.set('The College of Saint Scholastica', 'College of St. Scholastica');



module.exports = {
	importCollegeGPA : importCollegeGPA,
	importStudentProfiles: importStudentProfiles,
	importScorecardData: importScorecardData,
	importCollegeRankings: importCollegeRankings
};

//importScorecardData();
//importStudentProfiles("students-1.csv");
//importCollegeRankings();