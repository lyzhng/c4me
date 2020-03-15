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

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

const searchCollege = function (query)
{
	//query = typeof(query) === "string" ? query : "";
	let college = collections.College;
	let queryRegex = query.split(/ +/).filter((substr) => {return substr !== ""}).map((substr) => {return {name: new RegExp(escapeRegExp(substr))}});
		queryRegex = queryRegex.length !== 0 ? queryRegex : null;

	return new Promise(function (resolve, reject)
	{
		college.find({$and : queryRegex}, function (err, collegeArr)
		{
			resolve(collegeArr);
		});
	});
}





module.exports = {
	searchCollege: searchCollege 
};