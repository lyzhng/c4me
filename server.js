/* eslint-disable max-len */
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const jwtAuth = require('./jwt_middleware');
const collections = require('./models');
const backend = require('./backend');

const PORT = process.env.PORT || 3001;
const secret = process.env.JWT_SECRET_KEY || 'pokTGERW54389e#@$%mans12$@!$!#$^#%$';

const studentDatasets = ['students-1.csv', 'dummies.csv', 'students-2.csv']; // ADD ALL DATASETS HERE
const applicationDatasets = ['applications-1.csv', 'dummyapps.csv', 'applications-2.csv'];// ADD ALL DATASETS HERE

app = express();
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cookieParser());

mongoose.connect('mongodb://localhost/c4me', {useUnifiedTopology: true, useNewUrlParser: true});

app.get('/', (req, res)=>{
  res.send('Testing');
});

app.post('/api/register', async (req, res)=>{
  req.body.userid = req.body.userid.toLowerCase();
  if (req.body.userid !== 'admin') {
    try {
      const newStudent = await backend.studentHandler.registerStudent(req.body.userid, req.body.password);
      console.log('Created', newStudent);
      res.status(200).json({status: 'OK'});
    } catch (err) {
      res.status(401).json({error: err.message});
    }
  } else {
    res.status(401).json({error: 'userid or email already taken!'});
  }
});

app.post('/api/login', (req, res) => {
  const {userid, password} = req.body;
  if (userid === 'admin' && password === 'admin') { // HARD CODED ADMIN
    const payload = {userid: 'admin'};
    const token = jwt.sign(payload, secret, {
      expiresIn: '1d',
    });
    res.cookie('token', token, {httpOnly: false}).status(200).json({userid: 'admin'});
  } else { // NORMAL STUDENTS
    collections.Student.findOne({userid}).then((user)=>{
      if (!user) {
        res.status(401).json({error: 'Incorrect userid or password'});
      } else {
        user.isCorrectPassword(password, (same)=>{
          if (!same) {
            res.status(401).json({error: 'Incorrect userid or password'});
          } else {
            // Put values that we will need inside the token
            const payload = {userid};
            // Issue token
            const token = jwt.sign(payload, secret, {
              expiresIn: '1d',
            });
            res.cookie('token', token, {httpOnly: false}).status(200).send();
          }
        });
      }
    });
  }
});

app.get('/deletestudents', async (req, res)=>{
  await backend.adminHandler.deleteAllStudents();
  res.status(200).send();
});

app.get('/importstudentdatasets', async (req, res) => {
  const importAllStudents = studentDatasets.map(async (student) => {
    await backend.adminHandler.importStudentProfiles(student);
  });
  await Promise.all(importAllStudents);
  for (let i = 0; i < applicationDatasets.length; i++) {
    await backend.adminHandler.importApplicationData(applicationDatasets[i]);
  }
  res.status(200).send();
});

app.get('/scrapecollegerankings', async (req, res)=>{
  await backend.adminHandler.importCollegeRankings('./datasets/colleges.txt');
  res.status(200).send();
});

app.get('/scrapecollegedata', async (req, res)=>{
  await backend.adminHandler.importCollegeData('./datasets/colleges.txt');
  await backend.adminHandler.importCollegeDescriptions('./datasets/colleges.txt');
  res.status(200).send();
});

app.get('/importcollegescorecard', async (req, res)=>{
  await backend.adminHandler.importScorecardData('./datasets/colleges.txt');
  res.status(200).send();
});

// CHECKS IF WE ARE LOGGED IN OR NOT WITH MIDDLEWARE
app.get('/checkToken', jwtAuth, (req, res)=>{
  res.status(200).json({userid: req.userid});
});

app.post('/searchforcolleges', async (req, res) => {
  const colleges = await backend.collegeSearch.searchCollege(req.body.query);
  res.status(200).send({colleges: colleges});
});

app.post('/retrievestudents', async (req, res) => {
  const collegeName = req.body.query;
  const applications = await collections.Application.find({college: collegeName, questionable: false}).lean();
  console.log('Applications:', applications);
  const userIdList = applications.map((application) => application.userid);
  const students = await collections.Student.find({userid: {$in: userIdList}}).populate({path: 'applications'}).lean();
  res.status(200).send({students: students});
});

app.post('/getuser', async (req, res) => {
  try {
    const user = await backend.studentHandler.getStudentProfile(req.body.userId);
    res.status(200).json({user});
  } catch (error) {
    console.log(error);
    res.status(401).json({err: 'User does not exist'});
  }
});

app.post('/setStudentInfo', async (req, res) => {
  try {
    if ( (req.body.user.high_school_name && req.body.user.high_school_city )!== null  ){
      req.body.user.high_school_name = req.body.user.high_school_name.toLowerCase();
      req.body.user.high_school_city = req.body.user.high_school_city.toLowerCase();
    }
    await backend.studentHandler.editStudentInfo(req.body.user);
    await backend.studentHandler.importStudentHS(req.body.user);
    res.status(200).send({msg: 'Your profile have been update'});
  } catch (e) {
    res.status(200).json({err: 'High School Doesn\'t exist check School name, city and state'});
  }
});

app.post('/calculateSimilarHighschools', async (req, res) => {
  try {
    const results = await backend.computeScores.calculateSimilarHighschools(req.body.name, req.body.city, req.body.state);
    res.status(200).json({highschools: results});
  } catch (e) {
    console.log(e);
    res.status(400).send();
  }
});

app.post('/getapplications', async (req, res) => {
  const userid = req.body.query;
  const applications = await collections.Application.find({userid}).lean();
  console.log('Applications:', applications);
  res.status(200).send({applications: applications});
});

app.post('/updateapplications', async (req, res) => {
  const {
    statusTracker,
    userid,
  } = req.body;
  // console.log('Inside Update Applications');
  // console.log('Status Tracker: ', statusTracker);
  const ids = Object.keys(statusTracker);
  const student = await collections.Student.findOne({userid}).lean();
  for (const _id of ids) {
    // console.log('The status from statusTracker says', statusTracker[_id].status);
    await collections.Application.updateOne({_id}, {
      status: statusTracker[_id].status,
    });
    const questionable = await backend.computeScores.isQuestionableApplication(statusTracker[_id].collegeName, student, _id);
    console.log(`The application to ${statusTracker[_id].collegeName} is ${questionable}.`);
    await collections.Application.updateOne({_id}, {
      questionable,
    });
  }

  const updatedApplications = await collections.Application.find({_id: {$in: ids}}).lean();
  console.log('what i want');
  console.log(updatedApplications);

  res.status(200).send({
    applications: updatedApplications,
  });
});

app.post('/addapplication', async (req, res) => {
  const {
    userid,
    college,
    status,
    statusTracker,
  } = req.body;

  const newApplication = {
    userid,
    college,
    status,
    questionable: false,
  };

  const doc = await collections.Application.create(newApplication);
  let student = await collections.Student.findOne({userid}).lean();

  const questionable = await backend.computeScores.isQuestionableApplication(college, student, doc._id);
  await collections.Application.updateOne({_id: doc._id}, {
    questionable,
  });
  // console.log('New document inserted!');
  // console.log(doc);
  student = await collections.Student.updateOne({userid}, {$push: {applications: doc._id}});
  statusTracker[doc._id] = {
    status,
    collegeName: college,
  };
  // const updatedStudent = await collections.Student.findOne({userid}).lean();
  // console.log('Updated Student Information');
  // console.log(updatedStudent);

  // console.log('Updated Status Tracker');
  // console.log(statusTracker);

  student = await collections.Student.findOne({userid}).populate({path: 'applications'}).lean();
  // console.log('Student After Populating Again');
  // console.log(student);

  res.status(200).send({
    applications: student.applications,
    statusTracker,
  });
});

app.post('/deleteapplication', async (req, res) => {
  console.log('Deleting An Application');
  const {
    userid,
    _id,
    applications,
    statusTracker,
  } = req.body;

  const deleted = await collections.Application.deleteOne({_id});
  console.log('Deleted:', deleted);
  await collections.Student.updateOne({userid}, {$pull: {applications: _id}});
  const student = await collections.Student.findOne({userid}).lean();
  console.log('Student Now:', student);

  delete statusTracker[_id];
  const updatedApplications = applications.filter((app) => app._id !== _id);
  console.log('Status Tracker');
  console.log(statusTracker);
  console.log('Updated Applications');
  console.log(updatedApplications);

  res.status(200).send({
    applications: updatedApplications,
    statusTracker,
  });
});

app.post('/retrievequestionableapps', async (req, res) => {
  const questionableApps = await collections.Application.find({questionable: true});
  res.status(200).send({
    questionableApps,
  });
});

app.post('/marknotquestionable', async (req, res) => {
  const selectedApps = req.body.selectedApps;
  const questionableApps = req.body.questionableApps;
  console.log('selectedApps (server)', selectedApps);
  console.log('questionableApps (server)', questionableApps);
  for (const appId of selectedApps) {
    await collections.Application.updateOne({_id: appId}, {
      questionable: false,
    });
    const debugging = await collections.Application.findOne({_id: appId}).lean();
    console.log(debugging);
  }
  const updatedQuestionableApps = questionableApps.filter((app) => !selectedApps.includes(app._id));
  console.log('updatedQuestionableApps (server)', updatedQuestionableApps);
  res.status(200).send({questionableApps: updatedQuestionableApps});
});

app.post('/getallhighschools', async (req, res) => {
  let hs = await collections.HighSchool.find({}).lean();
  res.status(200).send({ highschools: hs });
});

app.listen(PORT, ()=>{
  console.log('Backend listening on port:', PORT);
});
