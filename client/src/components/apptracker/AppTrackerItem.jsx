import React from 'react';

export default class AppTrackerItem extends React.Component {
    constructor(props) {
        super(props);
    }
    
    render() {
        if (this.props.student) {
            console.log('AppTrackerItem has a student prop.');
            const {
                userid: userId,
                high_school_name: highSchool,
                high_school_city: highSchoolCity,
                high_school_state: highSchoolState,
                college_class: collegeClass,
                hidden
            } = this.props.student;
            return (
                <div style={{ display: hidden ? "none" : "block" }}>
                    <h3>Student ID: {userId}</h3>
                    <h5>College Class: {collegeClass}</h5>
                    {highSchool && <h5>High School: {highSchool}</h5>}
                    {highSchoolCity && highSchoolState && <h5>High School Location: {highSchoolCity}, {highSchoolState}</h5>}
                </div>
            )
        } else {
            console.log('AppTrackerItem does not have a student prop.');
            return null;
        }
    }
}