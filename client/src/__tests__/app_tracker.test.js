import React from 'react';
import { shallow, mount } from 'enzyme';
const { assert } = require('chai');

const collections = require('../../../models');
const { importStudentProfiles } = require('../../../backend/admin_handler');

import AppTracker from '../components/apptracker/AppTracker';
import AppTrackerItem from '../components/apptracker/AppTrackerItem';

const {
  filter,
  collegeClassFitsReq,
  highSchoolFitsReq,
  appFitsReq,
  addHighSchool,
} = AppTracker;

describe('AppTracker Component', () => {
  before(async function() {
    mongoose.connect('mongodb://localhost/c4me', {useUnifiedTopology: true, useNewUrlParser: true});
    await importStudentProfiles('students-1.csv', 'applications-1.csv');
  });

  it('should have initial states', () => {
    const wrapper = mount(<AppTracker />);
    const {
      students,
      minCollegeClass,
      maxCollegeClass,
      highSchools,
      currentHighSchool,
      appStatuses,
    } = wrapper.state();
    assert.equals(students.length, 0);
    assert.equals(minCollegeClass, Number.MIN_SAFE_INTEGER);
    assert.equals(maxCollegeClass, Number.MAX_SAFE_INTEGER);
    assert.equals(highSchools.size, 0);
    assert.equals(currentHighSchool, '');
    assert.equals(appStatuses.length, 0);
  });

  it('should add the high school to the high school state', function() {
    const wrapper = mount(<AppTracker />);
    wrapper.setState({ highSchools: new Set() });
    wrapper.find('.current-hs').simulate('change', {
      target: {
        value: 'Ward Melville Senior High School',
      },
    });
    wrapper.find('button.btn-add-hs').simulate('click');
    const { highSchools } = wrapper.state();
    assert.equal(highSchools.length, 1);
    assert.equals(highSchools.has('Ward Melville Senior High School'), true);
  });

  it('should return true if high school state is empty', async function() {
    const wrapper = mount(<AppTracker />);
    wrapper.setState({ highSchools: new Set() });
    const applications = await collections.Application.find({ college: 'Stony Brook University' }).lean();
    const userIdList = applications.map((application) => application.userid);
    for (const userId of userIdList) { 
      const student = await collections.Student.findOne({ userid: userId }).lean();
      assert.equal(highSchoolFitsReq(student), true);
    }
  });

  it('should return true if the high school fits the filter requirements', async function() {
    const wrapper = mount(<AppTracker />);
    wrapper.setState({ highSchools: new Set('Ward Melville Senior High School') });
    const applications = await collections.Application.find({ college: 'Stony Brook University' }).lean();
    const userIdList = applications.map((application) => application.userid);
    for (const userId of userIdList) { 
      const student = await collections.Student.findOne({ userid: userId }).lean();
      assert.equal(highSchoolFitsReq(student), true);
    }
  });

  it('should return true if student.college_class is within bounds', async function() {
    const wrapper = mount(<AppTracker />);
    wrapper.setState({ minCollegeClass: 2020 });
    wrapper.setState({ maxCollegeClass: 2025 });
    const applications = await collections.Application.find({ college: 'Stony Brook University' }).lean();
    const userIdList = applications.map((application) => application.userid);
    for (const userId of userIdList) { 
      const student = await collections.Student.findOne({ userid: userId }).lean();
      assert.equal(collegeClassFitsReq(student), true);
    }
  });

  it('should filter the correct students', () => {
    const wrapper = mount(<AppTracker />);
    wrapper.setState({ minCollegeClass: 2020 });
    wrapper.setState({ maxCollegeClass: 2025 });
    wrapper.setState({ highSchools: new Set('Ward Melville Senior High School') });
    // wrapper.setState({ appStatuses: [] });
    wrapper.find('button.btn-filter').simulate('click');
    const items = wrapper.find(AppTrackerItem);
  });
});