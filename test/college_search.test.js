const mongoose = require('mongoose');
const collections = require('../models');
const assert = require('chai').assert;
const {searchCollege} = require('../backend/college_search');

describe('search for colleges', () => {
  before(async () => {
    mongoose.connect('mongodb://localhost/c4me', {useUnifiedTopology: true, useNewUrlParser: true});
    const collegeCount = await collections.College.countDocuments({});
    assert.equal(collegeCount, 101);
  });
  after(() => {
    console.log('Finished with college search.');
  });
  it('should return a list of colleges that match the query (case insensitive)',
      async function() {
        this.timeout(0);
        await searchForCollege('american');
        await searchForCollege('university');
        await searchForCollege('barnard');
      });
});

async function searchForCollege(collegeName) {
  const queryResults = await searchCollege(collegeName);
  if (Array.isArray(queryResults)) {
    queryResults.forEach((result) => {
      const lowerOfficialName = result.name.toLowerCase();
      const lowerQueryName = collegeName.toLowerCase();
      assert.include(lowerOfficialName, lowerQueryName);
    });
  }
}
