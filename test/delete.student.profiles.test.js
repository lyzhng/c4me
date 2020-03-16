const mongoose = require('mongoose');
const collections  = require('../models');
const describe = require('mocha').describe;
const it = require('mocha').it;
const assert = require('chai').assert;


mongoose.connect("mongodb://localhost/c4me", { useUnifiedTopology: true, useNewUrlParser: true });