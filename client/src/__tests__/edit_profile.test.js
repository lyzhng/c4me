import React from 'react';
import { shallow, mount,render } from 'enzyme';
import Enzyme from 'enzyme';
import Profile from '../components/profile/Profile';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });


describe('<Profile />', () => {

  it('renders <Profile /> components', () => {
    const wrapper = mount(<Profile userid = "zplzpl" />);
    expect(wrapper).toHaveLength(1);
  });

  it('renders all  button components', () => {
    const wrapper = mount(<Profile userid = "zplzpl" />);
    expect(wrapper.find('button')).toHaveLength(2);
  });

  it('test the save button is clicked', () => {
    const wrapper = mount(<Profile userid = "zplzpl" />);
    wrapper.find('button').last().simulate('click');
  });

  it('test for edit student information profile ', ()=>{
    const wrapper = mount(<Profile userid = "zplzpl" />);
    const {
      userid,
      location,
      major_1,
      major_2,
      high_school_name,
    } = wrapper.state();
    wrapper.setState({userid : wrapper.find({name:'userid'})});
    wrapper.setState({location : wrapper.find({name:'location'})});
    wrapper.setState({major_1 : wrapper.find({name:'major_1'})});
    wrapper.setState({major_2 : wrapper.find({name:'major_2'})});
    wrapper.setState({HighSchool : wrapper.find({name:'HighSchool'})});
    wrapper.find('button').last().simulate('click');
    wrapper.simulate('change',{target: {location}});
    expect(location <= wrapper.find({name:'major_1'})).toEqual(true);
    wrapper.simulate('change',{target: {major_1}});
    expect(major_1 <= wrapper.find({name:'major_1'})).toEqual(true);
    wrapper.simulate('change',{target: {major_2}});
    expect(major_2 <= wrapper.find({name:'major_2'})).toEqual(true);
    wrapper.simulate('change',{target: {high_school_name}});
    expect(high_school_name <= wrapper.find({name:'high_school_name'})).toEqual(true);
  })

  it('test for edit student view score profile ', ()=>{
    const wrapper = mount(<Profile userid = "zplzpl" />);
    const {
      SAT_math,
      SAT_ebrw,
      ACT_math,
      ACT_reading,
      ACT_composite,
    } = wrapper.state();
    wrapper.setState({SAT_math : wrapper.find({name:'SAT_math'})});
    wrapper.setState({SAT_ebrw : wrapper.find({name:'SAT_ebrw'})});
    wrapper.setState({ACT_math : wrapper.find({name:'ACT_math'})});
    wrapper.setState({ACT_reading : wrapper.find({name:'ACT_reading'})});
    wrapper.setState({ACT_composite : wrapper.find({name:'ACT_composite'})});
    wrapper.find('button').last().simulate('SAT_math');
    wrapper.simulate('change',{target: {SAT_math}});
    expect(SAT_ebrw <= wrapper.find({name:'SAT_ebrw'})).toEqual(true);
    wrapper.simulate('change',{target: {ACT_math}});
    expect(ACT_math <= wrapper.find({name:'ACT_math'})).toEqual(true);
    wrapper.simulate('change',{target: {ACT_reading}});
    expect(ACT_reading <= wrapper.find({name:'ACT_reading'})).toEqual(true);
    wrapper.simulate('change',{target: {ACT_composite}});
    expect(ACT_composite <= wrapper.find({name:'ACT_composite'})).toEqual(true);
  })

});

