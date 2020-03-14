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
	let file = fs.readFileSync("./datasets/"+studentCsv,"utf-8")
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
	let file = fs.readFileSync("./datasets/"+applicationCSV, "utf-8");
	Papa.parse(file, {
		header: true,
		dynamicTyping: true,
		complete: (results) => {
			applicationData = results.data;
			applicationData.forEach((newApp, index) =>{
				collections.Application.findOne({userid: newApp.userid, college: newApp.college}).lean().then((resp) =>{
					if(!resp){
						collections.Application.create(newApp).then((resp) =>{
							collections.Student.updateOne({userid: newApp.userid}, {$push:{applications: resp._id}}).then((resp)=>{
								console.log("Added application for "+ newApp.userid+" with college: "+newApp.college+" and status:"+newApp.status);
							});
						});		
					}
				});
			});
		}
	});
};

//Drops student collection
const deleteAllStudents = () => {
	collections.Student.collection.drop().then(resp => {
		console.log("Dropped student collection");
	}).catch( err => {
		console.log("Student database already deleted");
	});
	collections.Application.collection.drop().then(resp => {
		console.log("Dropped application collection");
	}).catch( err => {
		console.log("Application database already deleted");
	});
}

//fill ranking field for each college in database
const importCollegeRankings = async function (filepath, callback) {
	let college = collections.College;
	await initCollege(filepath); //if no colleges in database, this will populate the database
	
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
				let collegeRankingsMap = {};
				let names = document.querySelectorAll("a.ranking-institution-title");
				let rankings = document.querySelectorAll(".rank.sorting_1.sorting_2");
				for (let i = 0; i < names.length; i ++)
				{
					if (rankings[i].textContent.indexOf("=") != -1)
					{
						collegeRankingsMap[names[i].textContent] = parseInt(rankings[i].textContent.substring(1));
					}
					else
					{
						collegeRankingsMap[names[i].textContent] = i + 1;
					}
				}
				return collegeRankingsMap;
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
		if (typeof(callback) === "function")
		{
			callback();
		}
	});
};

//fill description field for each college in database
const importCollegeDescriptions = async function (filepath, callback) {
	let college = collections.College;

	await initCollege(filepath); //if no colleges in database, this will populate the database
	
	let url = "https://www.timeshighereducation.com/world-university-rankings/";//harvard-university";
	
	college.find(async function (err, collegeArr)
	{
		for (let i = 0; i < collegeArr.length; i ++)
		{
			await new Promise (function(resolve, reject)
			{
				request(url + collegeArr[i].name.split(" ").join("-"), function(error, response, body)
				{
					if (error || response.statusCode !== 200)
					{
						console.log("couldn't pull description for " + collegeArr[i].name)
						console.log(error);
						console.log("response code: " + response.statusCode);
					}
					else
					{
						let dom = new JSDOM(body);
						let nodelist = dom.window.document.querySelectorAll(".pane-content p");
						let description = "";
						for (let i = 0; i < nodelist.length; i ++)
						{
							description += nodelist[i].textContent + "\n";
						}
						collegeArr[i].description = description;
						collegeArr[i].save();
						console.log("updated description for " + collegeArr[i].name + " at index " + i);
					}
					resolve();
				});
			});
		}
		if (typeof(callback) === "function")
		{
			callback();
		}
	});
};


const COLUMNS = ['INSTNM', 'CITY', 'STABBR', 'ZIP', 'INSTURL', 'ADM_RATE', 'TUITIONFEE_IN', 'TUITIONFEE_OUT', 'SATVR25', 'SATVR75', 'SATMT25', 'SATMT75', 'SATWR25', 'SATWR75', 'SATVRMID', 'SATMTMID', 'SATRMID', 'ACTCM25', 'ACTCM75', 'ACTEN25', 'ACTEN75', 'ACTMT25', 'ACTM75', 'ACTWR25', 'ACTWR75', 'ACTCMMID', 'ACTENMID', 'ACTMTMID', 'ACTWRMID', 'SAT_AVG'];
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

const importScorecardData = async () => {
	await initCollege();
	// if (!fs.existsSync(csvFilePath)) {
	await new Promise((resolve, reject) => {
		request('https://ed-public-download.app.cloud.gov/downloads/Most-Recent-Cohorts-All-Data-Elements.csv')
			.pipe(fs.createWriteStream(csvFilePath))
			.on('finish', resolve)
			.on('error', reject);
	});
	// }
	fs.readFile(csvFilePath, 'utf8', async (err, data) => {
		if (err) {
			console.log(err);
			return;
		}
		const colleges = [];
		const collegeNames = await getCollegeNames();
		// convert colleges.txt to excel.csv style to match with parser
		const collegesExcelStyle = collegeNames.map((college) => college.replace(', ', '-'));
		Papa.parse(data, {
			worker: true,
			header: true,
			dynamicTyping: true,
			step(row) {
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
					// console.log(college.INSTNM);
				}
			},
			complete: () => {
				const scorecardData = JSON.parse(JSON.stringify(colleges));
				scorecardData.forEach(async (college) => {
					let zipCode = college.ZIP;
					if (typeof college.ZIP === 'string') {
						const dashIndex = college.ZIP.indexOf('-');
						zipCode = +college.ZIP.substring(0, dashIndex);
					}
					console.log(college.INSTNM);
					await collections.College.updateOne({ name: college.INSTNM }, {
						location: {
							city: college.CITY,
							state: college.STABBR,
							zip: zipCode,
						},
						url: college.INSTURL.toLowerCase(),
						admission_rate: college.ADM_RATE !== 'NULL' ? college.ADM_RATE * 100 : -1,
						cost: {
							in_state: college.TUITIONFEE_IN,
							out_state: college.TUITIONFEE_OUT,
						},
					}, { upsert: true });
				});
				console.log('I am done!');
			}
		});
	});
}

const importCollegeGPA = async function (filepath,callback) {
	let college = collections.College;
	await initCollege(filepath);
	let collegeUrl;
	// let gpa_data = new Map();
	college.find(async function (err, collegeArr) {
		for (let i = 0; i < collegeArr.length; i++){
			collegeUrl = collegeArr[i].name;
			if (remapped_names.has(collegeArr[i].name)){
				collegeUrl = remapped_names.get(collegeArr[i].name);
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
						let dt_tags = $("dt").map(function() {return $(this).text();}).get();
						let dd_tags = $("dd").map(function() {return $(this).text();}).get();
						// let dd_tags = overview.find('dl').find('dd');
						let GPA;
						let AVG_ACT;
						for (let j=0; j < dt_tags.length; j++){
							if (dt_tags[j] === "Average GPA"){
								if (dd_tags[j] === "Not reported"){
									GPA = -1;
								}
								else
									GPA = dd_tags[j];
							}
							else if(dt_tags[j] === ("ACT Composite")){
								if (dd_tags[j].includes("average")){
									AVG_ACT = dd_tags[j].split("average")[0];
								}
								else{
									AVG_ACT = dd_tags[j];
									if (dd_tags[j] === "Not reported"){
										AVG_ACT = -1;
									}
									else{
										AVG_ACT = AVG_ACT.split(" ")[0];
										AVG_ACT = AVG_ACT.split("-");
										AVG_ACT = Math.ceil((parseInt(AVG_ACT[0])+parseInt(AVG_ACT[1]))/2);
									}
								}
							}
						}
						collegeArr[i].gpa = GPA;
						collegeArr[i].act.avg = AVG_ACT;
						collegeArr[i].save();
					}
					resolve();
				})
			});
		}
		if (typeof(callback) === "function")
		{
			callback();
		}
	});
};

let remapped_names = new Map();
remapped_names.set('Franklin and Marshall College', 'Franklin Marshall College');
remapped_names.set('SUNY College of Environmental Science and Forestry', 'State University of New York College of Environmental Science and Forestry');
remapped_names.set('The College of Saint Scholastica', 'College of St. Scholastica');


module.exports = {
	importCollegeGPA : importCollegeGPA,
	importStudentProfiles: importStudentProfiles,
	importScorecardData: importScorecardData,
	importCollegeRankings: importCollegeRankings,
	deleteAllStudents: deleteAllStudents,
	importCollegeDescriptions : importCollegeDescriptions
};

// importScorecardData();
//importStudentProfiles("students-1.csv");
// importCollegeRankings();
//deleteAllStudents();
// importCollegeDescriptions();
importCollegeGPA();