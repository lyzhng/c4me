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
const importStudentProfiles = (studentCsv, applicationCSV) => {
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
								let student = resp;
								collections.HighSchool.find({name:resp.high_school_name, location:resp.high_school_city +", "+resp.high_school_state}).then((resp)=>{
									if(resp.length === 0){
										importHighschoolData(student.high_school_name, student.high_school_city, student.high_school_state);
									}
								});
							}).catch(err => { console.log(err); });
						}
					});
				});
			Promise.all(studentsInsert).then(()=>{
				importApplicationData(applicationCSV);
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
};

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


const NUMERIC_COLUMNS = ['SATVR25', 'SATVRMID', 'SATVR75', 'SATMT25', 'SATMTMID', 'SATMT75', 'SATWR25', 'SATWRMID', 'SATWR75', 'ACTCM25', 'ACTCM75', 'ACTEN25', 'ACTEN75', 'ACTMT25', 'ACTMT75', 'ACTWR25', 'ACTWR75', 'ACTCMMID', 'ACTENMID', 'ACTMTMID', 'ACTWRMID', 'SAT_AVG', 'GRAD_DEBT_MDN', 'C100_4', 'ADM_RATE'];
const COLUMNS = ['INSTNM', 'CITY', 'STABBR', 'ZIP', 'INSTURL', 'CONTROL', 'TUITIONFEE_IN', 'TUITIONFEE_OUT', ...NUMERIC_COLUMNS];
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
			console.err(err);
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
						if (NUMERIC_COLUMNS.includes(column)) {
							collegeName = collegeName.replace('-', ', ');
							if (typeof row.data[column] === 'string') {
								college[column] = sanitizeString(row.data[column]);
							}
							if (typeof row.data[column] === 'number') {
								college[column] = row.data[column];
							}
						} else if (COLUMNS.includes(column)) {
							// convert back to colleges.txt naming style
							collegeName = collegeName.replace('-', ', ');
							if (column === 'CONTROL') {
								const institutionType = getInstitutionType(row.data[column]);
								college[column] = (institutionType !== null) ? institutionType : 'N/A';
							} else {
								college[column] = (column === 'INSTNM') ? collegeName : row.data[column];
							}
						}
					}
					colleges.push(college);
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
					await collections.College.updateOne({ name: college.INSTNM }, {
						location: {
							city: college.CITY,
							state: college.STABBR,
							zip: zipCode,
						},
						type: college.CONTROL,
						url: college.INSTURL.toLowerCase(),
						admission_rate: convertToPercent(college.ADM_RATE),
						completion_rate: convertToPercent(college.C100_4),
						cost: {
							tuition: {
								in_state: college.TUITIONFEE_IN,
								out_state: college.TUITIONFEE_OUT,
							}
						},
						grad_debt_mdn: college.GRAD_DEBT_MDN,
						sat: {
							reading_25: college.SATVR25,
							reading_50: college.SATVRMID,
							reading_75: college.SATVR75,
							writing_25: college.SATWR25,
							writing_50: college.SATWRMID,
							writing_75: college.SATVR75,
							math_25: college.SATMT25,
							math_50: college.SATMTMID,
							math_75: college.SATMT75,
							avg: -1,
						},
						act: {
							reading_25: college.ACTEN25,
							reading_50: college.ACTENMID,
							reading_75: college.ACTEN75,
							writing_25: college.ACTWR25,
							writing_50: college.ACTWRMID,
							writing_75: college.ACTWR75,
							math_25: college.ACTMT25,
							math_50: college.ACTMTMID,
							math_75: college.ACTMT75,
							composite_25: college.ACTCM25,
							composite_50: college.ACTCMMID,
							composite_75: college.ACTCM75,
							avg: -1,
						},

					}, { upsert: true });
				});
				console.log('I am done!');
			}
		});
	});
}

function sanitizeString(parsedValue) {
	return (parsedValue !== null && typeof parsedValue === 'string') && (parsedValue === 'NULL' || parsedValue === '"NULL"') ? -1 : parsedValue;
}

function getInstitutionType(numType) {
	let result;
	switch (numType) {
		case 1:
			result = 'Public';
			break;
		case 2:
			result = 'Private Non-Profit';
			break;
		case 3:
			result = 'Private For-Profit';
			break;
		default:
			result = null;
	}
	return result;
}

function convertToPercent(num) {
	if (typeof num !== 'number') {
		return null;
	}
	return num * 100;
}

function sanitizeString(parsedValue) {
	return (parsedValue !== null && typeof parsedValue === 'string') && (parsedValue === 'NULL' || parsedValue === '"NULL"') ? -1 : parsedValue;
}

const importCollegeData = async function (filepath,callback) {
	let college = collections.College;
	await initCollege(filepath);
	let collegeUrl;
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
						let GPA;
						let AVG_ACT;
						let cos_att = {
							in_state: null,
							out_state: null,
						};
						let cos_fee ={
							in_state: null,
							out_state: null,
						};
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
							else if (dt_tags[j] === "Cost of Attendance") {
								let cos_list = dd_tags[j].split("Out-of-state:");
								cos_att.in_state = parseInt(cos_list[0]);
								cos_att.out_state = parseInt(cos_list[1]);
								console.log(cos_att);
							}
							else if (dt_tags[j] === "Tuition and Fees"){
								let cos_list = dd_tags[j].split("Out-of-state:");
								cos_fee.in_state = parseInt(cos_list[0]);
								cos_fee.out_state = parseInt(cos_list[1]);
								console.log(cos_fee);
							}
							else if (dt_tags[j] === "Cost of Attendance") {
								if (dd_tags[j].includes("Out-of-state:")){
									let cos_list = dd_tags[j].split("Out-of-state:");
									cos_att.in_state = parseInt(cos_list[0].replace(/\$|,|(In-state:)|\b/g,''));
									cos_att.out_state = parseInt(cos_list[1].replace(/\$|,/g,''));
								}
								else{
									cos_att.in_state = cos_att.out_state = parseInt(dd_tags[j].replace(/\$|,/g,''));
								}
							}
							else if (dt_tags[j] === "Tuition and Fees"){
								if (dd_tags[j].includes("Out-of-state:")){
									let cos_list = dd_tags[j].split("Out-of-state:");
									cos_fee.in_state = parseInt(cos_list[0].replace(/\$|,|(In-state:)|\b/g,''));
									cos_fee.out_state = parseInt(cos_list[1].replace(/\$|,/g,''));
								}
								else{
									cos_fee.in_state = cos_fee.out_state = parseInt(dd_tags[j].replace(/\$|,/g,''));
								}
							}
						}
						collegeArr[i].gpa = GPA;
						collegeArr[i].act.avg = AVG_ACT;
						collegeArr[i].cost.attendance.in_state = isNaN(cos_att.in_state) ? -1: cos_att.in_state;
						collegeArr[i].cost.attendance.out_state = isNaN(cos_att.out_state) ? -1: cos_att.in_state;
						collegeArr[i].cost.tuition.in_state = isNaN(cos_fee.in_state) ? -1: cos_fee.in_state;
						collegeArr[i].cost.tuition.out_state = isNaN(cos_fee.out_state) ? -1: cos_fee.in_state;
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

const userAgents = ['Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36',
'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:74.0) Gecko/20100101 Firefox/74.0', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36',
'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36'];

const scrapeAcademicRanking = ($) => {
	let grades = $("#report-card .card--profile .report-card .profile__buckets .profile__bucket--2 .ordered__list__bucket li .profile-grade--two").map(function(){return $(this).text()}).get();
	//grades[0] returns AcademicsA-, e.g. AcademicsA+, so take substring starting with index 9
	return grades[0].substring(9, grades[0].length);
};

const scrapeCollegePrepRanking = ($) => {
	let grades = $("#report-card .card--profile .report-card .profile__buckets .profile__bucket--2 .ordered__list__bucket li .profile-grade--two").map(function(){return $(this).text()}).get();
	//grades[3] returns College PrepGrade, e.g. College PrepA+, so take substring starting with index 12
	return grades[3].substring(12, grades[3].length);
};

const scrapeSAT = ($) => {
	let scalarLabels = $("#academics .profile__bucket--3 div .blank__bucket .scalar--three div").map((function(){return $(this).text();})).get();
	let indexOfScore = scalarLabels.indexOf("Average SAT composite score out of 1600, as reported by Niche users from this school.");
	if(indexOfScore >= 0){
		let satScores = scalarLabels[indexOfScore + 3];
		if(satScores !== "—"){
			satScores = parseFloat(satScores.substring(0,satScores.length - scalarLabels[indexOfScore + 4].length));
			return satScores;
		}
	}
	return null;
};

const scrapeACT = ($) => {
	let scalarLabels = $("#academics .profile__bucket--3 div .blank__bucket .scalar--three div").map((function(){return $(this).text();})).get();
	let indexOfScore = scalarLabels.indexOf("Average ACT composite score out of 36, as reported by Niche users from this school.");
	if(indexOfScore >= 0){
		let actScores = scalarLabels[indexOfScore + 3];
		if(actScores !== "—"){
			actScores = parseFloat(actScores.substring(0,actScores.length - scalarLabels[indexOfScore + 4].length));
			return actScores;
		}
	}
	return null;
};

const scrapeAP_enrollment = ($) =>{
	let scalarLabels = $("#academics .profile__bucket--3 div .blank__bucket .scalar--three div").map((function(){return $(this).text();})).get();
	let indexOfScore = scalarLabels.indexOf("AP Enrollment");
	if(indexOfScore >= 0){
		let apEnrollment = parseFloat(scalarLabels[indexOfScore + 1]);
		if(!isNaN(apEnrollment)) return apEnrollment;
	}
	return null;
};

const scrapeSimilarAppliedColleges = ($) => {
 let popularCollegeList = $(".popular-entity-link").map(function(){return $(this).text()}).get();
 return popularCollegeList;
};

const importHighschoolData = (name, city, state) => {
	let url ="https://www.niche.com/k12/"+ name + "-" +city + "-" +state;
	url = url.split(" ").join("-");
	axios.get(url, 
	{headers:{
		'Host': 'www.niche.com',
		'User-Agent':  Math.floor(Math.random() * 3),
		'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
		'Accept-Language': 'en-US,en;q=0.5',
		'Accept-Encoding': 'gzip, deflate, br',
		'DNT': '1',
		'Connection': 'keep-alive',
		'Cookie': '_pxhd=b03406b8705b7f8353ccba6e98571777c6f328d316bfaf6f533f0682adde7bb3:4cc57971-6648-11ea-8e32-4bc99936e254; _pxhd=b03406b8705b7f8353ccba6e98571777c6f328d316bfaf6f533f0682adde7bb3:4cc57971-6648-11ea-8e32-4bc99936e254; xid=dabb0501-8a9d-4bd3-ac3b-f95e850e490e; navigation=%7B%22location%22%3A%7B%22guid%22%3A%2214b82916-cfce-4bae-a87e-d5610ef2f8a6%22%2C%22type%22%3A%22County%22%2C%22name%22%3A%22St.%20Francois%20County%22%2C%22url%22%3A%22st-francois-county-mo%22%7D%2C%22navigationMode%22%3A%22full%22%2C%22vertical%22%3A%22k12%22%2C%22mostRecentVertical%22%3A%22k12%22%2C%22suffixes%22%3A%7B%22colleges%22%3A%22%2Fs%2Fmissouri%2F%22%2C%22graduate-schools%22%3A%22%2Fs%2Fmissouri%2F%22%2C%22k12%22%3A%22%2Fc%2Fst-francois-county-mo%2F%22%2C%22places-to-live%22%3A%22%2Fc%2Fst-francois-county-mo%2F%22%2C%22places-to-work%22%3A%22%2Fc%2Fst-francois-county-mo%2F%22%7D%7D; experiments=mini_expansion_header%7Cvariation1%5E%5E%5E%240%7C1%5D; _gcl_au=1.1.1273538567.1584227130; niche_sessionPageCount=16; niche_npsSurvey=0; niche_fullStory=0; niche_singleFirstPageview=1; _ga=GA1.2.1996521713.1584227130; _gid=GA1.2.484543382.1584227130; _fbp=fb.1.1584227130694.666677108; _cmpQcif3pcsupported=1; _scid=38a247e1-2e5a-4858-9a44-2910b5661ce8; _pxvid=4cc57971-6648-11ea-8e32-4bc99936e254; _sctr=1|1584158400000; niche_singleProfilePageview=1; niche_singleK12Pageview=1; recentlyViewed=entityHistory%7CentityName%7CCentral%2BHigh%2BSchool%7CentityGuid%7C88d1fd1f-bafd-4257-9d52-ec3ec7e0c298%7CentityType%7CSchool%7CentityFragment%7Ccentral-high-school-park-hills-mo%7CStratford%2BHigh%2BSchool%7C4a2b0a34-a0e3-4add-90ce-92c5f610d200%7Cstratford-high-school-stratford-tx%7CCobalt%2BInstitute%2Bof%2BMath%2B%26%2BScience%7C72cf8eaa-7e3c-4f05-82bc-cf11d26b56c5%7Ccobalt-institute-of-math--and--science-victorville-ca%7CThe%2BQueens%2BSchool%2Bof%2BInquiry%7Cf116a725-9b62-437c-ac29-3b5801e29ee1%7Cthe-queens-school-of-inquiry-flushing-ny%7CsearchHistory%7CSt.%2BFrancois%2BCounty%7C14b82916-cfce-4bae-a87e-d5610ef2f8a6%7CCounty%7Cst-francois-county-mo%7CSherman%2BCounty%7C76b68cf8-bdb9-4b94-b60e-fa58e70359f1%7Csherman-county-tx%7CSan%2BBernardino%2BCounty%7C97af0462-bff4-4231-85f5-b7f95c1a7fa9%7Csan-bernardino-county-ca%5E%5E%5E%240%7C%40%241%7C2%7C3%7C4%7C5%7C6%7C7%7C8%5D%7C%241%7C9%7C3%7CA%7C5%7C6%7C7%7CB%5D%7C%241%7CC%7C3%7CD%7C5%7C6%7C7%7CE%5D%7C%241%7CF%7C3%7CG%7C5%7C6%7C7%7CH%5D%5D%7CI%7C%40%241%7CJ%7C3%7CK%7C5%7CL%7C7%7CM%5D%7C%241%7CN%7C3%7CO%7C5%7CL%7C7%7CP%5D%7C%241%7CQ%7C3%7CR%7C5%7CL%7C7%7CS%5D%5D%5D; profileModalPromptShown=true; __gads=ID=e5c3d5ccf60cad4a:T=1584227585:S=ALNI_MbKnoXV93C7y94k0nsVIk3Kb5UbKA; G_ENABLED_IDPS=google; hintSeenLately=true; _dc_gtm_UA-2431522-39=1; +fCF0WpZQ4w2cRNE5j40p6w60qQ6sfap3mIzI4BabJc=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJuaWNoZS5jb20iLCJleHAiOjE1OTIwMDM5MjcsImlhdCI6MTU4NDIyNzkyNywic3ViIjoiNjU5MDE5MzMtNjgxMC00ZTFkLWIxOWYtOThmZTRlYzRiNzBiIiwic2NvcGUiOiJsb2dpbiJ9.rwvr-8L341xLgDwCoty0on5JkErkMpan-xF-_rwAUZjU86-MVFbOJUGpALwVuQTKVeyc1gnpQ5RZ0LBbxZ98KHbk9PkWN-WuVqLJVWaH0-fsR5_J801ICpFYBO3WHmsdw1ft_35wJ7DwV7h--LMs-YMarb_J-pSy8vjFXeXeQXm-beECzskAe-Y_6VfQfNBZcatlpo0NWq0qYrIKtPCkgtMYZEgs_x0JkZESbkG1F6MXWovdSSDynC17AUsV0GahlcMSSmG6D6B-iq03TQEiobJuC_wKoBuLrYnV2yYZLVdjSEp-U3ckl8y2e2nWGuyeFwB3T-dZxjcUODIeFU79dw; emailVerificationPrompts=2; _pxff_wa=1; _pxff_tm=1',
		'Upgrade-Insecure-Requests': '1',
		'TE': 'Trailers'
	}}
	).then((resp) => {
	let html = cheerio.load(resp.data);
	let highschool = {
		name,
		location: city+", "+state
	};
	highschool.avg_SAT = scrapeSAT(html);
	highschool.avg_ACT = scrapeACT(html);
	highschool.AP_enrollment = scrapeAP_enrollment(html);
	highschool.academic_ranking = scrapeAcademicRanking(html);
	highschool.college_prep_ranking = scrapeCollegePrepRanking(html);
	highschool.similar_colleges_applied = scrapeSimilarAppliedColleges(html);
	collections.HighSchool.create(highschool).then(resp => {
		console.log("Created:", resp);
	}).catch(err =>{ console.log(err) });
	}).catch((err)=>{
		console.log("Scrape for high school:",name, city, state, "Gave the following error:",err.response.status, err.response.statusText);
	});
};


module.exports = {
	importCollegeData : importCollegeData,
	importStudentProfiles: importStudentProfiles,
	importScorecardData: importScorecardData,
	importCollegeRankings: importCollegeRankings,
	deleteAllStudents: deleteAllStudents,
	importCollegeDescriptions : importCollegeDescriptions,
	importHighschoolData : importHighschoolData
};

//importScorecardData();
//importStudentProfiles("students-1.csv","applications-1.csv");
//importCollegeRankings();
//deleteAllStudents();
//importCollegeDescriptions();
//importCollegeData();
//importHighschoolData("blah", "blah", "blah");
//importHighschoolData("central high school", "park hills", "mo");
//importHighschoolData("Ward Melville Senior High School", "East Setauket", "ny");
//importHighschoolData("James Madison High School", "Brooklyn", "ny");
//importHighschoolData("The queens school of inquiry", "flushing", "ny");
//importHighschoolData("Francis Lewis High school","fresh meadows", "ny");
