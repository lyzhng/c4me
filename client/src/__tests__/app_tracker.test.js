import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import toJson from 'enzyme-to-json';

import AppTracker from '../components/apptracker/AppTracker';

Enzyme.configure({ adapter: new Adapter() });

let appCount = 0;
const students = [];

const sampleProps = {
  college: {
    name: 'Stony Brook University'
  }
}

describe('AppTracker Component', () => {
  beforeAll(() => {
    createSampleStudents();
  });

  it('should have initial states', () => {
    const wrapper = shallow(<AppTracker {...sampleProps} />);
    const {
      students,
      minCollegeClass,
      maxCollegeClass,
      highSchools,
      currentHighSchool,
      appStatuses,
    } = wrapper.state();
    expect(students.length).toBe(0);
    expect(minCollegeClass).toBe(0);
    expect(maxCollegeClass).toBe(Number.MAX_SAFE_INTEGER);
    expect(highSchools.size).toBe(0);
    expect(currentHighSchool).toBe('');
    expect(appStatuses.length).toBe(0);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should add the high school to the high school state', function() {
    const wrapper = shallow(<AppTracker {...sampleProps} />);
    const sampleHighSchool = 'Ward Melville Senior High School';
    wrapper.setState({ highSchools: new Set() });
    wrapper.setState({ currentHighSchool: sampleHighSchool });
    wrapper.find('button.btn-add-hs').simulate('click');
    const { highSchools } = wrapper.state();
    expect(highSchools.size).toBe(1);
    expect(highSchools.has(sampleHighSchool)).toBe(true);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should return true if high school state is empty', function () {
    const wrapper = shallow(<AppTracker {...sampleProps} />);
    wrapper.setState({ students });
    wrapper.setState({ highSchools: new Set() });
    for (const s of students) { 
      wrapper.update();
      expect(wrapper.instance().highSchoolFitsReq(s)).toBe(true);
    }
  });

  it('should return true if the high school fits the filter requirements', function() {
    const wrapper = shallow(<AppTracker {...sampleProps} />);
    wrapper.setState({ students });
    const hs = new Set();
    hs.add('Ward Melville Senior High School');
    wrapper.setState({ highSchools: hs });
    for (const s of students) {
      wrapper.update();
      if (hs.has(s.high_school_name)) {
        console.log(s);
        expect(wrapper.instance().highSchoolFitsReq(s)).toBe(true);
      } else {
        expect(wrapper.instance().highSchoolFitsReq(s)).toBe(false);
      }
    }
  });

  it('should return true if student.college_class is within bounds', function() {
    const wrapper = shallow(<AppTracker {...sampleProps} />);
    wrapper.setState({ students });
    wrapper.setState({ minCollegeClass: 2020 });
    wrapper.setState({ maxCollegeClass: 2025 });
    const {
      minCollegeClass,
      maxCollegeClass
    } = wrapper.state();
    for (const s of students) {
      const withinBounds = minCollegeClass <= s.college_class && s.college_class <= maxCollegeClass;
      if (withinBounds) {
        expect(wrapper.instance().collegeClassFitsReq(s)).toBe(true);
      } else {
        expect(wrapper.instance().collegeClassFitsReq(s)).toBe(false);
      }
      wrapper.update();
    }
  });

  it('should return true if student application to that college is filtered', function() {
    const wrapper = shallow(<AppTracker {...sampleProps} />);
    wrapper.setState({ students });
    wrapper.setState({
      appStatuses: [
        'accepted',
      ]
    });
    const {
      appStatuses,
    } = wrapper.state();

    if (appStatuses.length === 0) {
      expect(wrapper.instance().appFitsReq(s)).toBe(true);
    }

    for (const s of students) {
      const { status: appStatus, college } = s.applications[0];
      if (appStatuses.includes(appStatus) && college === sampleProps.college.name) {
          expect(wrapper.instance().appFitsReq(s)).toBe(true);
      } else {
          expect(wrapper.instance().appFitsReq(s)).toBe(false);
      }
      wrapper.update();
    }
  });

  it('should filter the correct students', () => {
    const wrapper = shallow(<AppTracker {...sampleProps} />);
    wrapper.setState({ students });
    const {
      collegeClassFitsReq,
      highSchoolFitsReq,
      appFitsReq,
    } = wrapper.instance();
    const hs = new Set();
    hs.add('Ward Melville Senior High School');
    wrapper.setState({ minCollegeClass: 2020 });
    wrapper.setState({ maxCollegeClass: 2025 });
    wrapper.setState({ highSchools: hs });
    wrapper.setState({ appStatuses: ['accepted'] });
    wrapper.find('button.btn-filter').simulate('click');
    wrapper.update();
    for (const s of students) {
      if (collegeClassFitsReq(s) && highSchoolFitsReq(s) && appFitsReq(s)) {
        expect(s.hidden).toBe(false);
      } else {
        expect(s.hidden).toBe(true);
      }
    }
  });
});

function createStudent(userid, password, high_school_name, college_class, college, status) {
  const student = {
    _id: userid,
    userid,
    password,
    high_school_name,
    college_class,
    applications: [
      createApplication(appCount++, 'Stony Brook University', 'accepted'),
    ]
  };
  return student;
}

function createApplication(_id, college, status) {
  const app = {
    _id,
    college,
    status
  };
  return app;
}

function createSampleStudents() {
  const student1 = createStudent('sample1', '12345678', 'Ward Melville Senior High School', 2024, 'Stony Brook University', 'accepted');
  const student2 = createStudent('sample2', '12345678', 'Francis Lewis High School', 2021, 'Princeton University', 'deferred');
  const student3 = createStudent('sample3', '12345678', 'Ward Melville Senior High School', 2030, 'Princeton University', 'wait-listed');
  const student4 = createStudent('sample4', '12345678', 'Brooklyn Technical High School', 2027, 'Princeton University', 'accepted');
  const student5 = createStudent('sample5', '12345678', 'Stuyvesant High School', 2027, 'Harvard University', 'accepted');
  students.push(student1);
  students.push(student2);
  students.push(student3);
  students.push(student4);
  students.push(student5);
}