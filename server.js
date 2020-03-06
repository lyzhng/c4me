const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const axios = require('axios');
const db = require('./models');

const PORT = process.env.PORT || 3001;
const secret = process.env.JWT_SECRET_KEY || "pokTGERW54389e#@$%mans12$@!$!#$^#%$";

app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res)=>{
 res.send("Testing");
});

app.post("/register", (req, res)=>{
  db.Student.find({$or: [{username:req.body.username}, {email:req.body.email}]}, "email username").lean().then((resp) => {
    if(resp.length === 0){
      db.Student.create(req.body).then((dbmodel)=>{
        console.log("Created new user:", dbmodel);
        res.status(200);
      });
    }
    else{
      res.status(401).json({error:"Username or email already taken!"});
    }
  });
});

app.post("/login", (req, res)=>{
  const { username, password } = req.body;
    db.User.findOne({ username }).then((user)=>{
      if (!user) {
        res.status(401).json({error: 'Incorrect username or password'});
      } 
      else {
        user.isCorrectPassword(password).then((same)=>{
          if (!same) {
            res.status(401)
              .json({
                error: 'Incorrect username or password'
            });
          } 
          else {
            //Put values that we will need inside the token
            const payload = { username };
            // Issue token
            const token = jwt.sign(payload, secret, {
              expiresIn: '1d'
            });
            res.cookie('token', token, { httpOnly: true })
              .sendStatus(200);
          }
        });
      }
    });
});

app.listen(PORT, ()=>{
    console.log("Backend listening on port:",PORT);
});