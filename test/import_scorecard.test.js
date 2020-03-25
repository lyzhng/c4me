const mongoose = require('mongoose');
const collections = require('../models');
// const describe = require('mocha').describe;
// const it = require('mocha').it;
const assert = require('chai').assert;
const { importScorecardData } = require('../backend/admin_handler');

describe('import scorecard data', () => {
  before(() => {
    mongoose.connect("mongodb://localhost/c4me", { useUnifiedTopology: true, useNewUrlParser: true });
    // await collections.College.deleteMany({})
  });
  it('should import scorecard data', async function () {
    this.timeout(0);
    await importScorecardData('./datasets/colleges.txt');
    const collegeCount = await collections.College.countDocuments({});
    assert.equal(collegeCount, 101);
    try {
      const colleges = await collections.College.find({}).lean();
      colleges.forEach((college) => {
        checkGeneralInfo(college);
        checkACT(college.act);
        checkSAT(college.sat);
      });
    } catch (err) {
      console.log('could not retrieve from database');
    }
  });
});

function checkGeneralInfo(college) {
  const { name, type, location, url, admission_rate: admissionRate, cost, grad_debt_mdn: graduationDebtMdn } = college;
  assert.typeOf(name, 'string');
  assert.typeOf(type, 'string');
  assert.notTypeOf(location, 'null');
  assert.typeOf(location.city, 'string');
  assert.typeOf(location.state, 'string');
  assert.typeOf(location.zip, 'number');
  assert.typeOf(url, 'string');
  assert.typeOf(admissionRate, 'number');
  assert.notTypeOf(cost, 'null');
  assert.notTypeOf(cost.tuition, 'null');
  assert.typeOf(cost.tuition.in_state, 'number');
  assert.typeOf(cost.tuition.out_state, 'number');
  assert.typeOf(graduationDebtMdn, 'number');
}

function checkACT(act) {
  const {
    english_25: ACTEN25,
    english_50: ACTEN50,
    english_75: ACTEN75,
    writing_25: ACTWR25,
    writing_50: ACTWR50,
    writing_75: ACTWR75,
    math_25: ACTMT25,
    math_50: ACTMT50,
    math_75: ACTMT75,
    composite_25: ACTCM25,
    composite_50: ACTCM50,
    composite_75: ACTCM75,
  } = act;
  assert.notTypeOf(act, 'null');
  assert.typeOf(ACTEN25, 'number');
  assert.typeOf(ACTEN50, 'number');
  assert.typeOf(ACTEN75, 'number');
  assert.typeOf(ACTWR25, 'number');
  assert.typeOf(ACTWR50, 'number');
  assert.typeOf(ACTWR75, 'number');
  assert.typeOf(ACTMT25, 'number');
  assert.typeOf(ACTMT50, 'number');
  assert.typeOf(ACTMT75, 'number');
  assert.typeOf(ACTCM25, 'number');
  assert.typeOf(ACTCM50, 'number');
  assert.typeOf(ACTCM75, 'number');
}

function checkSAT(sat) {
  const {
    reading_25: SATRD25,
    reading_50: SATRD50,
    reading_75: SATRD75,
    writing_25: SATWR25,
    writing_50: SATWR50,
    writing_75: SATWR75,
    math_25: SATMT25,
    math_50: SATMT50,
    math_75: SATMT75,
  } = sat;
  assert.notTypeOf(sat, 'null');
  assert.typeOf(SATRD25, 'number');
  assert.typeOf(SATRD50, 'number');
  assert.typeOf(SATRD75, 'number');
  assert.typeOf(SATWR25, 'number');
  assert.typeOf(SATWR50, 'number');
  assert.typeOf(SATWR75, 'number');
  assert.typeOf(SATMT25, 'number');
  assert.typeOf(SATMT50, 'number');
  assert.typeOf(SATMT75, 'number');
}