const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const jwtAuth = require('./jwt_middleware'); 
const axios = require('axios');
const collections = require('./models');
const backend = require('./backend');

const PORT = process.env.PORT || 3001;
const secret = process.env.JWT_SECRET_KEY || "pokTGERW54389e#@$%mans12$@!$!#$^#%$";

const studentDatasets = ["students-1.csv"];
const applicationDatasets = ["applications-1.csv"];

app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

mongoose.connect("mongodb://localhost/c4me", { useUnifiedTopology: true, useNewUrlParser: true });

app.get("/", (req, res)=>{
  res.send("Testing");
});

app.post("/api/register", (req, res)=>{
  collections.Student.find({userid:req.body.userid}).lean().then((resp) => {
    if(resp.length === 0){
      collections.Student.create(req.body).then((collectionsmodel)=>{
        console.log("Created new user:", collectionsmodel);
        res.status(200).json({status:"OK"});
      });
    }
    else{
      res.status(401).json({error:"userid or email already taken!"});
    }
  });
});

app.post("/api/login", (req, res)=>{
  const { userid, password } = req.body;
  //HARD CODED ADMIN
  if(userid === "sam" && password === "chen"){
    const payload = {userid: "admin"}
    const token = jwt.sign(payload, secret, {
      expiresIn: '1d'
    });
    res.cookie('token', token, { httpOnly: false }).status(200).json({userid:"admin"});
  }
  //NORMAL STUDENTS
  else{
    collections.Student.findOne({ userid }).then((user)=>{
      if (!user) {
        res.status(401).json({error: 'Incorrect userid or password'});
      } 
      else {
        user.isCorrectPassword(password,(same)=>{
          if (!same)
            res.status(401).json({error: 'Incorrect userid or password'});
          else {
            //Put values that we will need inside the token
            const payload = { userid };
            // Issue token
            const token = jwt.sign(payload, secret, {
              expiresIn: '1d'
            });
            res.cookie('token', token, { httpOnly: false }).status(200).send();
          }
        })
      }
    });
  }  
});

app.get("/deletestudents", (req, res)=>{
  backend.adminHandler.deleteAllStudents();
  res.status(200).send();
});

app.get("/importstudentdatasets", (req, res)=>{
  backend.adminHandler.importStudentProfiles(studentDatasets[0], applicationDatasets[0]);
  res.status(200).send();
});

app.get("/scrapecollegerankings", (req, res)=>{
  backend.adminHandler.importCollegeRankings("./datasets/colleges.txt");
  res.status(200).send();
});

app.get("/scrapecollegedata", (req, res)=>{
  backend.adminHandler.importCollegeData("./datasets/colleges.txt");
  backend.adminHandler.importCollegeDescriptions("./datasets/colleges.txt");
  res.status(200).send();
});

app.get("/importcollegescorecard", (req, res)=>{
  backend.adminHandler.importScorecardData("./datasets/colleges.txt");
  res.status(200).send();
});

//CHECKS IF WE ARE LOGGED IN OR NOT WITH MIDDLEWARE
app.get('/checkToken', jwtAuth, (req, res)=>{
  res.status(200).json({userid:req.userid});
});

app.post("/searchforcolleges", async (req, res) => {
  let colleges = await backend.studentHandler.searchCollege(req.body.query);
  res.status(200).send({colleges : colleges});
});

app.listen(PORT, ()=>{
  console.log("Backend listening on port:",PORT);
});