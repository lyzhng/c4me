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


const registerStudent = async (newUserid, password) => {
	return await collections.Student.find({userid:newUserid}).lean().then(async (resp) => {
		if(resp.length === 0){
		  return await collections.Student.create({userid:newUserid, password: password});;
		}
		else{
		  throw new Error("userid or email already taken!")
		}
	  });
}

const login = async(userid, password, callback) => {

}

module.exports = {
	registerStudent: registerStudent
}
