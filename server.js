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


app.listen(PORT, ()=>{
    console.log("Backend listening on port:",PORT);
})