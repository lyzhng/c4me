import React from 'react';
import { Link } from 'react-router-dom';

export default class AppTrackerItem extends React.Component {
    constructor(props) {
        super(props);
    }
    
    render() {
        if (this.props.student) {
            const {
                userid: userId,
                high_school_name: highSchool,
                high_school_city: highSchoolCity,
                high_school_state: highSchoolState,
                college_class: collegeClass,
                hidden
            } = this.props.student;
            return (
                <div style={{ display: hidden ? "none" : "block" }} className="student-item">
                    <Link to={`/profile/${userId}`}><h3>{userId}</h3></Link>
                    <h5>College Class: {collegeClass}</h5>
                    {highSchool && <h5>High School: {highSchool}</h5>}
                    {highSchoolCity && highSchoolState && <h5>High School Location: {highSchoolCity}, {highSchoolState}</h5>}
                </div>
            )
        } else {
            return null;
        }
    }
}