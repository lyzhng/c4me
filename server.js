const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const jwtAuth = require('./jwt_middleware');
const collections = require('./models');
const backend = require('./backend');

const PORT = process.env.PORT || 3001;
const secret = process.env.JWT_SECRET_KEY || 'pokTGERW54389e#@$%mans12$@!$!#$^#%$';

const studentDatasets = ['students-1.csv', 'dummies.csv']; // ADD ALL DATASETS HERE
const applicationDatasets = ['applications-1.csv', 'dummyapps.csv'];// ADD ALL DATASETS HERE

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
  for (let i = 0; i < studentDatasets.length; i++) {
    await backend.adminHandler.importStudentProfiles(studentDatasets[i]);
  }
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
  const applications = await collections.Application.find({college: collegeName}).lean();
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
    await backend.studentHandler.importStudentHS(req.body.user);
    await backend.studentHandler.editStudentInfo(req.body.user);
    res.status(200).send({msg: 'Your profile have been update'});
  } catch (e) {
    res.status(200).json({err: 'High School Doesn\'t exist check School name, city and state'});
  }
});

app.listen(PORT, ()=>{
  console.log('Backend listening on port:', PORT);
});
