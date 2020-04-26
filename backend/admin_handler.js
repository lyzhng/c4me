/* eslint-disable prefer-promise-reject-errors */
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const axios = require('axios');
const Papa = require('papaparse');
const fs = require('fs');
const collections = require('../models');
const request = require('request');
const puppeteer = require('puppeteer');
const jsdom = require('jsdom');
const {JSDOM} = jsdom;
const userAgents = require('./user_agents');
const getCollegeNames = require('../backend/get_college_names');
const initCollege = require('./init_colleges.js');

mongoose.connect('mongodb://localhost/c4me', {useUnifiedTopology: true, useNewUrlParser: true});

// Addes a student to the database. Used in the map function below
const insertStudent = async (student, resolve) =>{
  student.userid = student.userid.toLowerCase();
  const resp = await collections.Student.find({userid: student.userid});
  // if the student userid hasn't been used and it doesnt equal to admin we will create a new student
  if (resp.length === 0 && student.userid !== 'admin') {
    // holds the student that is created
    const created = await collections.Student.create(student);
    console.log('created', created.userid);
    // finds the highschool in database that student has, if it doesnt exist, we scrape for it
    if (created.high_school_name && created.high_school_city && created.high_school_state) {
      const resp = await collections.HighSchool.find({
        name: created.high_school_name,
        location: created.high_school_city + ', ' + created.high_school_state,
      });
      if (resp.length === 0) {
        try {
          await importHighschoolData(created.high_school_name, created.high_school_city, created.high_school_state);
        } catch (err) {
          console.log(err);
        }
      }
    }
  }
  resolve();
};

// import student profile csv and takes in name of csv file
const importStudentProfiles = async (studentCsv) => {
  let studentData;
  const file = fs.readFileSync('./datasets/'+studentCsv, 'utf-8');
  Papa.parse(file, {
    worker: true,
    header: true,
    dynamicTyping: true,
    complete: (results)=>{
      studentData = results.data;
      // CSV has random spacing inside the columns, so this removes it inorder to insert into db easier.
      studentData = JSON.parse(JSON.stringify(studentData).replace(/\s(?=\w+":)/g, ''));
    },
  });
  const importAllStudents = studentData.map((student) => {
    return new Promise((resolve) => {
      insertStudent(student, resolve);
    });
  });

  await Promise.all(importAllStudents);
  console.log('done with importing students');
  console.log('Done with importing highschools from students');
};

// Adds an application to the database. Used for the map function below.
const importApplication = async (newApp, resolve) => {
  const resp = await collections.Application.findOne({userid: newApp.userid, college: newApp.college});
  if (!resp) {
    const createdApp = await collections.Application.create(newApp);
    await collections.Student.updateOne({userid: newApp.userid}, {$push: {applications: createdApp._id}});
    console.log('Added application for '+ newApp.userid+' with college: '+newApp.college+' and status: '+newApp.status);
  }
  resolve();
};

// imports application csv and takes in string containing name of csv
const importApplicationData = async (applicationCSV) =>{
  let applicationData;
  const file = fs.readFileSync('./datasets/'+applicationCSV, 'utf-8');
  Papa.parse(file, {
    worker: true,
    header: true,
    dynamicTyping: true,
    complete: async (results) => {
      applicationData = results.data;
    },
  });
  // using map function to iterate through each application and inserting to database
  const importApplications = applicationData.map((newApp) =>{
    return new Promise((resolve) => {
      importApplication(newApp, resolve);
    });
  });
  await Promise.all(importApplications);
  console.log('Done with importing all applications');
};

// Drops student collection
const deleteAllStudents = (callback) => {
  return new Promise(async function(resolve, reject) {
    await collections.Student.collection.drop();
    await collections.Application.collection.drop();
    resolve();
  });
};

// fill ranking field for each college in database
const importCollegeRankings = async function(filepath) {
  return new Promise(async function(resolve, reject) {
    const college = collections.College;
    await initCollege(filepath); // if no colleges in database, this will populate the database

    const allRankingsUrl = 'https://www.timeshighereducation.com/rankings/united-states/2020#!/page/0/length/-1/sort_by/rank/sort_order/asc/cols/stats';

    college.find(async function(err, collegeArr) {
      let allRankings;
      await new Promise(async function(resolve, reject) {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.goto(allRankingsUrl);
        allRankings = await page.evaluate(() => {
          const collegeRankingsMap = {};
          const names = document.querySelectorAll('a.ranking-institution-title');
          const rankings = document.querySelectorAll('.rank.sorting_1.sorting_2');
          for (let i = 0; i < names.length; i ++) {
            if (rankings[i].textContent.indexOf('=') != -1) {
              collegeRankingsMap[names[i].textContent] = parseInt(rankings[i].textContent.substring(1));
            } else {
              collegeRankingsMap[names[i].textContent] = i + 1;
            }
          }
          return collegeRankingsMap;
        });
        browser.close();

        resolve();
      });

      for (let i = 0; i < collegeArr.length; i ++) {
        if (allRankings[collegeArr[i].name] === null) {
          console.log('could not pull ranking for ' + collegeArr[i].name);
        } else {
          collegeArr[i].ranking = allRankings[collegeArr[i].name];
          collegeArr[i].save();
          console.log('updated ranking for ' + collegeArr[i].name + ': ' + allRankings[collegeArr[i].name]);
        }
      }
      resolve();
    });
  });
};

// fill description field for each college in database
const importCollegeDescriptions = async function(filepath) {
  return new Promise(async function(resolve, reject) {
    const college = collections.College;

    await initCollege(filepath); // if no colleges in database, this will populate the database

    const url = 'https://www.timeshighereducation.com/world-university-rankings/';// harvard-university";

    college.find(async function(err, collegeArr) {
      console.log(collegeArr.length);
      for (let i = 0; i < collegeArr.length; i ++) {
        await new Promise(function(resolve, reject) {
          request(url + collegeArr[i].name.split(' ').join('-'), function(error, response, body) {
            if (error || response.statusCode !== 200) {
              console.log('couldn\'t pull description for ' + collegeArr[i].name);
              console.log(error);
              console.log('response code: ' + response.statusCode);
            } else {
              const dom = new JSDOM(body);
              const nodelist = dom.window.document.querySelectorAll('.pane-content p');
              let description = '';
              for (let i = 0; i < nodelist.length; i ++) {
                description += nodelist[i].textContent + '\n';
              }
              collegeArr[i].description = description;
              collegeArr[i].save();
              console.log('updated description for ' + collegeArr[i].name + ' at index ' + i);
            }
            resolve();
          });
        });
      }
      resolve();
    });
  });
};


const NUMERIC_COLUMNS = ['SATVR25', 'SATVRMID', 'SATVR75', 'SATMT25', 'SATMTMID', 'SATMT75', 'SATWR25', 'SATWRMID', 'SATWR75', 'ACTCM25', 'ACTCM75', 'ACTEN25', 'ACTEN75', 'ACTMT25', 'ACTMT75', 'ACTWR25', 'ACTWR75', 'ACTCMMID', 'ACTENMID', 'ACTMTMID', 'ACTWRMID', 'SAT_AVG', 'GRAD_DEBT_MDN', 'C100_4', 'ADM_RATE'];
const COLUMNS = ['INSTNM', 'CITY', 'STABBR', 'ZIP', 'INSTURL', 'CONTROL', 'TUITIONFEE_IN', 'TUITIONFEE_OUT', ...NUMERIC_COLUMNS];
const csvFilePath = './datasets/college_scorecard.csv';

// { excel.csv: colleges.txt }
const remappedColleges = {
  'Franklin and Marshall College': 'Franklin & Marshall College',
  'Indiana University-Bloomington': 'Indiana University Bloomington',
  'The College of Saint Scholastica': 'The College of St Scholastica',
  'The University of Alabama': 'University of Alabama',
  'The University of Montana': 'University of Montana',
  'University of Massachusetts-Amherst': 'University of Massachusetts Amherst',
};

const importScorecardData = async (filepath) => {
  await initCollege(filepath);
  if (!fs.existsSync(csvFilePath)) {
    await new Promise((resolve, reject) => {
      console.log('Downloading college_scorecard.csv...');
      request('https://ed-public-download.app.cloud.gov/downloads/Most-Recent-Cohorts-All-Data-Elements.csv')
          .pipe(fs.createWriteStream(csvFilePath))
          .on('finish', resolve)
          .on('error', reject);
      console.log('Done writing to', csvFilePath);
    });
  }
  const csvData = fs.readFileSync(csvFilePath, 'utf8');
  const colleges = [];
  const collegeNames = await getCollegeNames('./datasets/colleges.txt');
  console.log('Got college names');
  let scorecardData;
  // convert colleges.txt to excel.csv style to match with parser
  const collegesExcelStyle = collegeNames.map((college) => college.replace(', ', '-'));
  Papa.parse(csvData, {
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
      console.log('Done parsing and filtering', csvFilePath);
      scorecardData = JSON.parse(JSON.stringify(colleges));
    },
  });
  const collegeArray = [];
  scorecardData.forEach((college) => {
    collegeArray.push(college);
  });
  for (let i = 0; i < collegeArray.length; i++) {
    const college = collegeArray[i];
    let zipCode = college.ZIP;
    if (typeof college.ZIP === 'string') {
      const dashIndex = college.ZIP.indexOf('-');
      zipCode = +college.ZIP.substring(0, dashIndex);
    }
    await collections.College.updateOne(
        {name: college.INSTNM},
        {
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
            },
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
          },
          act: {
            english_25: college.ACTEN25,
            english_50: college.ACTENMID,
            english_75: college.ACTEN75,
            writing_25: college.ACTWR25,
            writing_50: college.ACTWRMID,
            writing_75: college.ACTWR75,
            math_25: college.ACTMT25,
            math_50: college.ACTMTMID,
            math_75: college.ACTMT75,
            composite_25: college.ACTCM25,
            composite_50: college.ACTCMMID,
            composite_75: college.ACTCM75,
          },
        },
    );
  }
  console.log('I am done!');
};

function sanitizeString(parsedValue) {
  return (parsedValue !== null && typeof parsedValue === 'string') && (parsedValue === 'NULL' || parsedValue === '"NULL"') ?
    -1 : parsedValue;
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
    return -1;
  }
  return num * 100;
}

const importCollegeData = async function(filepath) {
  return new Promise(async function(resolve, reject) {
    const college = collections.College;
    let collegeUrl;
    await initCollege(filepath);
    college.find(async function(err, collegeArr) {
      for (let i = 0; i < collegeArr.length; i++) {
        collegeUrl = collegeArr[i].name;
        if (remappedNames.has(collegeArr[i].name)) {
          collegeUrl = remappedNames.get(collegeArr[i].name);
        }
        const regex = /\b(The)\s\b/gi;
        collegeUrl = collegeUrl.replace(regex, '');
        collegeUrl = collegeUrl.replace(/,|&/g, '');
        collegeUrl = collegeUrl.replace(/\s+/g, '-');
        await new Promise(function(resolve, reject) {
          request({
            method: 'GET',
            url: 'https://www.collegedata.com/college/' + collegeUrl,
          }, async (err, res, body)=>{
            if (err || res.statusCode !== 200) {
              console.log('failed to request collegeData!');
              reject();
            } else {
              const $ = cheerio.load(body);
              const size = $('#profile-overview .statbar .statbar__item .h2').map(function() {
                return $(this).text();
              }).get();

              const dtTags = $('dt').map(function() {
                return $(this).text();
              }).get();
              const ddTags = $('dd').map(function() {
                return $(this).text();
              }).get();
              let GPA = -1;
              let AVG_ACT = -1;
              let AVG_MAT = -1;
              let AVG_RW = -1;
              const costAttendance = {
                in_state: -1,
                out_state: -1,
              };
              // const costTuition ={
              //   in_state: null,
              //   out_state: null,
              // };
              for (let j=0; j < dtTags.length; j++) {
                if (dtTags[j] === 'Average GPA') {
                  if (ddTags[j] === 'Not reported') {
                    GPA = -1;
                  } else {
                    GPA = ddTags[j];
                  }
                } else if (dtTags[j] === 'SAT Math') {
                  if (ddTags[j].includes('average')) {
                    AVG_MAT = ddTags[j].split('average')[0];
                  } else {
                    if (ddTags[j].includes('Not reported')) {
                      AVG_MAT = -1;
                    } else {
                      AVG_MAT = ddTags[j].split(' ')[0];
                      AVG_MAT = AVG_MAT.split('-');
                      AVG_MAT = Math.ceil((parseInt(AVG_MAT[0])+parseInt(AVG_MAT[1]))/2);
                    }
                  }
                } else if (dtTags[j] === 'SAT EBRW') {
                  if (ddTags[j].includes('average')) {
                    AVG_RW = ddTags[j].split('average')[0];
                  } else {
                    if (ddTags[j].includes('Not reported')) {
                      AVG_RW = -1;
                    } else {
                      AVG_RW = ddTags[j].split(' ')[0];
                      AVG_RW = AVG_RW.split('-');
                      AVG_RW = Math.ceil((parseInt(AVG_RW[0])+parseInt(AVG_RW[1]))/2);
                    }
                  }
                } else if (dtTags[j] === 'ACT Composite') {
                  if (ddTags[j].includes('average')) {
                    AVG_ACT = ddTags[j].split('average')[0];
                  } else {
                    AVG_ACT = ddTags[j];
                    if (ddTags[j] === 'Not reported') {
                      AVG_ACT = -1;
                    } else {
                      AVG_ACT = AVG_ACT.split(' ')[0];
                      AVG_ACT = AVG_ACT.split('-');
                      AVG_ACT = Math.ceil((parseInt(AVG_ACT[0])+parseInt(AVG_ACT[1]))/2);
                    }
                  }
                } else if (dtTags[j] === 'Cost of Attendance') {
                  if (ddTags[j].includes('Out-of-state:')) {
                    const costList = ddTags[j].split('Out-of-state:');
                    costAttendance.in_state = parseInt(costList[0].replace(/\$|,|(In-state:)|\b/g, ''));
                    costAttendance.out_state = parseInt(costList[1].replace(/\$|,/g, ''));
                  } else {
                    costAttendance.in_state = costAttendance.out_state = parseInt(ddTags[j].replace(/\$|,/g, ''));
                  }
                }
                // else if (dt_tags[j] === "Tuition and Fees"){
                //   if (dd_tags[j].includes("Out-of-state:")){
                //     let cos_list = dd_tags[j].split("Out-of-state:");
                //     cos_fee.in_state = parseInt(cos_list[0].replace(/\$|,|(In-state:)|\b/g,''));
                //     cos_fee.out_state = parseInt(cos_list[1].replace(/\$|,/g,''));
                //   }
                //   else{
                //     cos_fee.in_state = cos_fee.out_state = parseInt(dd_tags[j].replace(/\$|,/g,''));
                //   }
                // }
              }
              collegeArr[i].gpa = GPA;
              collegeArr[i].act.avg = AVG_ACT;
              collegeArr[i].size = size[0] == null ? -1: parseInt(size[0].replace(/,/g, ''));
              collegeArr[i].sat.math_avg = isNaN(AVG_MAT) ? -1: AVG_MAT;
              collegeArr[i].sat.EBRW_avg = isNaN(AVG_RW) ? -1: AVG_RW;
              collegeArr[i].cost.attendance.in_state = isNaN(costAttendance.in_state) ? -1: costAttendance.in_state;
              collegeArr[i].cost.attendance.out_state = isNaN(costAttendance.out_state) ? -1: costAttendance.out_state;
              // collegeArr[i].cost.tuition.in_state = isNaN(cos_fee.in_state) ? -1: cos_fee.in_state;
              // collegeArr[i].cost.tuition.out_state = isNaN(cos_fee.out_state) ? -1: cos_fee.out_state;
              // collegeArr[i].save();
              await new Promise(function(resolve, reject) {
                request({
                  method: 'GET',
                  url: 'https://www.collegedata.com/college/' + collegeUrl +'?tab=profile-academics-tab',
                }, (err, res, body)=>{
                  if (err || res.statusCode !== 200) {
                    console.log('failed to request collegeData!');
                    // eslint-disable-next-line prefer-promise-reject-errors
                    reject();
                  } else {
                    const $ = cheerio.load(body);
                    const liTags = $('#profile-academics .card:nth-child(2) .card-body .row .col-sm-6 .list--nice li').map(function() {
                      return $(this).text();
                    }).get();
                    for (let j = 0; j < liTags.length; j++) {
                      collegeArr[i].majors.push(liTags[j]);
                    }
                    collegeArr[i].save();
                    resolve();
                  }
                });
              });
              resolve();
            }
          });
        });
      }
      console.log('Finished importing College Data.');
      resolve();
    });
  });
};

const remappedNames = new Map();
remappedNames.set('Franklin and Marshall College', 'Franklin Marshall College');
remappedNames.set('SUNY College of Environmental Science and Forestry', 'State University of New York College of Environmental Science and Forestry');
remappedNames.set('The College of Saint Scholastica', 'College of St. Scholastica');


const scrapeAcademicRanking = ($) => {
  const grades = $('#report-card .card--profile .report-card .profile__buckets .profile__bucket--2 .ordered__list__bucket li .profile-grade--two').map(function() {
    return $(this).text()
    ;
  }).get();
  // grades[0] returns AcademicsA-, e.g. AcademicsA+, so take substring starting with index 9
  return grades[0].substring(9, grades[0].length);
};

const scrapeCollegePrepRanking = ($) => {
  const grades = $('#report-card .card--profile .report-card .profile__buckets .profile__bucket--2 .ordered__list__bucket li .profile-grade--two').map(function() {
    return $(this).text()
    ;
  }).get();
  // grades[3] returns College PrepGrade, e.g. College PrepA+, so take substring starting with index 12
  return grades[3].substring(12, grades[3].length);
};

const scrapeSAT = ($) => {
  const scalarLabels = $('#academics .profile__bucket--3 div .blank__bucket .scalar--three div').map((function() {
    return $(this).text();
  })).get();
  const indexOfScore = scalarLabels.indexOf('Average SAT composite score out of 1600, as reported by Niche users from this school.');
  if (indexOfScore >= 0) {
    let satScores = scalarLabels[indexOfScore + 3];
    if (satScores !== '—') {
      satScores = parseFloat(satScores.substring(0, satScores.length - scalarLabels[indexOfScore + 4].length));
      return satScores;
    }
  }
  return -1;
};

const scrapeACT = ($) => {
  const scalarLabels = $('#academics .profile__bucket--3 div .blank__bucket .scalar--three div').map((function() {
    return $(this).text();
  })).get();
  const indexOfScore = scalarLabels.indexOf('Average ACT composite score out of 36, as reported by Niche users from this school.');
  if (indexOfScore >= 0) {
    let actScores = scalarLabels[indexOfScore + 3];
    if (actScores !== '—') {
      actScores = parseFloat(actScores.substring(0, actScores.length - scalarLabels[indexOfScore + 4].length));
      return actScores;
    }
  }
  return -1;
};

const scrapeAPEnrollment = ($) =>{
  const scalarLabels = $('#academics .profile__bucket--3 div .blank__bucket .scalar--three div').map((function() {
    return $(this).text();
  })).get();
  const indexOfScore = scalarLabels.indexOf('AP Enrollment');
  if (indexOfScore >= 0) {
    const apEnrollment = parseFloat(scalarLabels[indexOfScore + 1]);
    if (!isNaN(apEnrollment)) return apEnrollment;
  }
  return -1;
};

const scrapeSimilarAppliedColleges = ($) => {
  const popularCollegeList = $('.popular-entity-link').map(function() {
    return $(this).text()
    ;
  }).get();
  return popularCollegeList;
};

const importHighschoolData = async (name, city, state) => {
  const college = await collections.HighSchool.find({name, city, state});
  if (college.length === 0) {
    // let url = 'https://www.niche.com/k12/' + name + '-' + city + '-' + state;
    let url = 'http://allv22.all.cs.stonybrook.edu/~stoller/cse416/niche/'+ name + '-' + city + '-' + state;
    url = url.split(' ').join('-');
    console.log(url);
    await axios.get(url,
        {
          // headers: {
          //   //'Host': 'www.niche.com',
          //   'User-Agent': userAgents[Math.floor(Math.random() * 49)],
          //   'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          //   'Accept-Language': 'en-US,en;q=0.5',
          //   'Accept-Encoding': 'gzip, deflate, br',
          //   'DNT': '1',
          //   'Upgrade-Insecure-Requests': '1',
          //   'TE': 'Trailers',
          // }
        },
    ).then(async (resp) => {
      const html = cheerio.load(resp.data);
      const highschool = {
        name,
        city: city,
        state: state,
      };
      highschool.avg_SAT = scrapeSAT(html);
      highschool.avg_ACT = scrapeACT(html);
      highschool.AP_enrollment = scrapeAPEnrollment(html);
      highschool.academic_ranking = scrapeAcademicRanking(html);
      highschool.college_prep_ranking = scrapeCollegePrepRanking(html);
      highschool.similar_colleges_applied = scrapeSimilarAppliedColleges(html);
      const created = await collections.HighSchool.create(highschool);
      console.log('Created:', created);
    }).catch((err) => {
      console.log(err);
      throw new Error('Fail to scrape for high school with name:', name, city, state);
      // console.log('Scrape for high school:', name, city, state, 'Gave the following error:', err.response.status, err.response.statusText);
    });
  }
};


module.exports = {
  importCollegeData: importCollegeData,
  importStudentProfiles: importStudentProfiles,
  importScorecardData: importScorecardData,
  importCollegeRankings: importCollegeRankings,
  deleteAllStudents: deleteAllStudents,
  importCollegeDescriptions: importCollegeDescriptions,
  importHighschoolData: importHighschoolData,
  importApplicationData: importApplicationData,
};

// (async () => await importScorecardData())();
// importStudentProfiles("students-1.csv","applications-1.csv");
// (async () => await importCollegeRankings())();
// deleteAllStudents();
// importCollegeDescriptions();
// importCollegeData();
// importHighschoolData("blah", "blah", "blah");
// importHighschoolData("central high school", "park hills", "mo");
// importHighschoolData("Ward Melville Senior High School", "East Setauket", "ny");
// importHighschoolData("James Madison High School", "Brooklyn", "ny");
// importHighschoolData("The queens school of inquiry", "flushing", "ny");
// importHighschoolData("Francis Lewis High school","fresh meadows", "ny");