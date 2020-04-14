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
    expect(wrapper).toHaveLength(1);
    wrapper.find('button').last().simulate('click');
  });

  it('test for edit student information profile ', ()=>{
    const wrapper = mount(<Profile userid = "zplzpl" />);
    expect(wrapper).toHaveLength(1);
    const {
      userid,
      residence_state,
      major_1,
      major_2,
      high_school_name,
      college_class,
      num_AP_passed,
    } = wrapper.state();
    wrapper.setState({userid : wrapper.find({name:'userid'})});
    wrapper.setState({residence_state : wrapper.find({name:'residence_state'})});
    wrapper.setState({major_1 : wrapper.find({name:'major_1'})});
    wrapper.setState({major_2 : wrapper.find({name:'major_2'})});
    wrapper.setState({high_school_name : wrapper.find({name:'high_school_name'})});
    wrapper.setState({college_class : wrapper.find({name:'college_class'})});
    wrapper.setState({num_AP_passed : wrapper.find({name:'num_AP_passed'})});
    wrapper.find('button').last().simulate('click');
    wrapper.simulate('change',{target: {residence_state}});
    expect(residence_state <= wrapper.find({name:'residence_state'})).toEqual(true);
    wrapper.simulate('change',{target: {major_1}});
    expect(major_1 <= wrapper.find({name:'major_1'})).toEqual(true);
    wrapper.simulate('change',{target: {major_2}});
    expect(major_2 <= wrapper.find({name:'major_2'})).toEqual(true);
    wrapper.simulate('change',{target: {high_school_name}});
    expect(high_school_name <= wrapper.find({name:'high_school_name'})).toEqual(true);
    wrapper.simulate('change',{target: {college_class}});
    expect(college_class <= wrapper.find({name:'college_class'})).toEqual(true);
    wrapper.simulate('change',{target: {num_AP_passed}});
    expect(num_AP_passed <= wrapper.find({name:'num_AP_passed'})).toEqual(true);
  });

  it('test for edit student view score profile ', ()=>{
    const wrapper = mount(<Profile userid = "zplzpl" />);
    expect(wrapper).toHaveLength(1);
    const {
      SAT_math,
      SAT_EBRW,
      ACT_math,
      ACT_reading,
      ACT_composite,
    } = wrapper.state();
    wrapper.setState({SAT_math : wrapper.find({name:'SAT_math'})});
    wrapper.setState({SAT_EBRW : wrapper.find({name:'SAT_ebrw'})});
    wrapper.setState({ACT_math : wrapper.find({name:'ACT_math'})});
    wrapper.setState({ACT_reading : wrapper.find({name:'ACT_reading'})});
    wrapper.setState({ACT_composite : wrapper.find({name:'ACT_composite'})});
    wrapper.find('button').last().simulate('click');
    wrapper.simulate('change',{target: {SAT_math}});
    expect(SAT_EBRW <= wrapper.find({name:'SAT_EBRW'})).toEqual(true);
    wrapper.simulate('change',{target: {ACT_math}});
    expect(ACT_math <= wrapper.find({name:'ACT_math'})).toEqual(true);
    wrapper.simulate('change',{target: {ACT_reading}});
    expect(ACT_reading <= wrapper.find({name:'ACT_reading'})).toEqual(true);
    wrapper.simulate('change',{target: {ACT_composite}});
    expect(ACT_composite <= wrapper.find({name:'ACT_composite'})).toEqual(true);
  })

});
