const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const jwtAuth = require('./jwt_middleware'); 
const axios = require('axios');
const db = require('./models');

const PORT = process.env.PORT || 3001;
const secret = process.env.JWT_SECRET_KEY || "pokTGERW54389e#@$%mans12$@!$!#$^#%$";

app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

mongoose.connect("mongodb://localhost/c4me", { useUnifiedTopology: true, useNewUrlParser: true });

app.get("/", (req, res)=>{
  res.send("Testing");
});

app.post("/api/register", (req, res)=>{
  db.Student.find({$or: [{userid:req.body.userid}, {email:req.body.email}]}, "email userid").lean().then((resp) => {
    if(resp.length === 0){
      db.Student.create(req.body).then((dbmodel)=>{
        console.log("Created new user:", dbmodel);
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
    db.Student.findOne({ userid }).then((user)=>{
      if (!user) {
        res.status(401).json({error: 'Incorrect userid or password'});
      } 
      else {
        user.isCorrectPassword(password,(same)=>{
          if (!same) {
            res.status(401)
              .json({
                error: 'Incorrect userid or password'
            });
          } 
          else {
            //Put values that we will need inside the token
            const payload = { userid };
            // Issue token
            const token = jwt.sign(payload, secret, {
              expiresIn: '1d'
            });
            res.cookie('token', token, { httpOnly: false })
              .sendStatus(200);
          }
        })
      }
    });
});

//CHECKS IF WE ARE LOGGED IN OR NOT WITH MIDDLEWARE
app.get('/checkToken', jwtAuth, (req, res)=>{
  res.sendStatus(200);
});


app.listen(PORT, ()=>{
  console.log("Backend listening on port:",PORT);
});