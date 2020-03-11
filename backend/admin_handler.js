const cheerio = require('cheerio');
const mongoose = require('mongoose');
const axios = require('axios');
const papa = require('papaparse');
const fs = require('fs');
const collections = require('../models');
const request = require("request");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

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

module.exports = {
	importStudentProfiles: importStudentProfiles
};

importCollegeRankings();