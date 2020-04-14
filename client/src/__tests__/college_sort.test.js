//configuration
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import toJson from 'enzyme-to-json';
configure({ adapter: new Adapter() });


import React from 'react';
import { mount, shallow, render } from 'enzyme';
import CollegeSearch from '../components/college/SearchColleges.jsx';
const fs = require('fs');
const colleges = JSON.parse(fs.readFileSync("./src/__tests__/colleges.json")).colleges;

describe('CollegeSearch', () => {
  it('should sort colleges by rank after clicking sort by rank', async() => {
    const component = mount((<CollegeSearch userid = "sam"/>));
    const sortCriteriaInput = component.find({ name: 'sortCriteria'});
    const sortButton = component.find('button').at(1);

  	//set component college state to colleges
  	component.state().colleges = colleges;
  	//set ascending to true
  	component.state().ascending = true;

  	//change sortCriteria to name and sort
  	sortCriteriaInput.simulate('change', {target : {name : "sortCriteria", value : "name"}});
  	sortButton.simulate('click');
  	for (let i = 0; i < component.state().colleges.length - 1; i ++)
  	{
  		let college1 = component.state().colleges[i];
  		let college2 = component.state().colleges[i + 1];

  		expect(college1.name.toLowerCase() <= college2.name.toLowerCase()).toEqual(true);	
  	}

  	//change sortCriteria to admission rate
  	sortCriteriaInput.simulate('change', {target : {name : "sortCriteria", value : "admissionRate"}});
  	sortButton.simulate('click');
  	for (let i = 0; i < component.state().colleges.length - 1; i ++)
  	{
  		let college1 = component.state().colleges[i];
  		let college2 = component.state().colleges[i + 1];

  		expect(college1.admission_rate <= college2.admission_rate).toEqual(true); 		
  	}

  	//change sortCriteria to cost of attendance
  	sortCriteriaInput.simulate('change', {target : {name : "sortCriteria", value : "costOfAttendance"}});
  	sortButton.simulate('click');
  	for (let i = 0; i < component.state().colleges.length - 1; i ++)
  	{
  		let college1 = component.state().colleges[i];
  		let college2 = component.state().colleges[i + 1];

  		expect(college1.cost.attendance.in_state <= college2.cost.attendance.in_state).toEqual(true);	
  	}

  	//change sortCriteria to ranking
  	sortCriteriaInput.simulate('change', {target : {name : "sortCriteria", value : "ranking"}});
  	sortButton.simulate('click');
  	for (let i = 0; i < component.state().colleges.length - 1; i ++)
  	{
  		let college1 = component.state().colleges[i];
  		let college2 = component.state().colleges[i + 1];

  		expect(college1.ranking <= college2.ranking).toEqual(true);
  	}
    
  });
});

