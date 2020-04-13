import React from 'react';
import Axios from 'axios';
import AppTrackerItem from './AppTrackerItem';
import Scatterplot from './Scatterplot';

export default class AppTracker extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            students: [],
            minCollegeClass: 0,
            maxCollegeClass: Number.MAX_SAFE_INTEGER,
            highSchools: new Set(),
            currentHighSchool: '',
            appStatuses: [],
            scatterplot: false,
        };
    }

    setDefaultState = () => {
        this.setState({
            minCollegeClass: this.state.minCollegeClass === '' ? Number.MIN_SAFE_INTEGER : this.state.minCollegeClass,
            maxCollegeClass: this.state.maxCollegeClass === '' ? Number.MAX_SAFE_INTEGER : this.state.maxCollegeClass,
        });
    }

    handleChange = (e) => {
        this.setState({
            [e.target.name]: (isInt(e.target.value) ? +e.target.value : e.target.value)
        }, this.setDefaultState);
    }

    filter = (e) => {
        e.preventDefault();
        const students = this.state.students;
        for (const s of students) {
            const fitsCriteria = this.appFitsReq(s) && this.highSchoolFitsReq(s) && this.collegeClassFitsReq(s);
            // console.log('App Status Fits?', this.appFitsReq(s));
            // console.log('High School Fits?', this.highSchoolFitsReq(s));
            // console.log('College Class Fits?', this.collegeClassFitsReq(s));
            s.hidden = fitsCriteria ? false : true;
        }
        this.setState({ students: students });
    }

    collegeClassFitsReq = (student) => {
        const collegeClass = student.college_class;
        const { minCollegeClass, maxCollegeClass } = this.state;
        // console.log('College Class of Student', collegeClass);
        // console.log('Min College Class', minCollegeClass);
        // console.log('Max College Class', maxCollegeClass);
        return minCollegeClass <= collegeClass && collegeClass <= maxCollegeClass;
    }
    
    highSchoolFitsReq = (student) => {
        const highSchool = student.high_school_name;
        const { highSchools } = this.state;
        return highSchools.size === 0 || highSchools.has(highSchool); // might have to make it less specific
    }

    appFitsReq = (student) => {
        const { appStatuses } = this.state;
        const { applications } = student;
        const { name } = this.props.college;

        if (appStatuses.length === 0) {
            return true;
        } 

        for (const application of applications) {
            const { college, status } = application;
            const sameCollege = (application.college === name);
            const desired = appStatuses.includes(status);
            console.log(status, 'to', college);
            if (sameCollege && desired) {
                return true;
            }
        }
        return false;
    }

    addHighSchool = () => {
        this.setState({ highSchools: new Set([...this.state.highSchools, this.state.currentHighSchool]) });
    }

    removeHighSchool = (e) => {
        e.preventDefault();
        const { highSchools } = this.state;
        const name = document.querySelector('.high-school-unit > .high-school-name').textContent;
        highSchools.delete(name);
        this.setState({ highSchools });
    }

    handleAppStatuses = (e) => {
        const choice = e.target.name;
        if (this.state.appStatuses.includes(choice)) {
            let filteredCopy = this.state.appStatuses.filter((status) => status !== choice);
            this.setState({ appStatuses: filteredCopy });
        } else {
            this.setState({ appStatuses: [...this.state.appStatuses, choice] });
        }
    }

    async componentDidMount() {
        if (this.props.college) {
            const collegeName = this.props.college.name;
            const resp = await Axios.post('/retrievestudents', { query: collegeName });
            this.setState({ students: resp.data.students });
            console.log('Students:', this.state.students);
        }
    }

    toggleScatterplot = () => {
        this.setState({ scatterplot: !this.state.scatterplot });
    }

    render() {
        return (
            <div>
                <div className="filters">
                    <h2>App Tracker for {this.props.college.name}</h2>
                    {/* college class */}
                    <div className="row">
                        <label htmlFor="minCollegeClass">Min. College Class</label>
                        <input type="number" name="minCollegeClass" min="0" onChange={this.handleChange} />
                    </div>
                    <div className="row">
                        <label htmlFor="maxCollegeClass">Max. College Class</label>
                        <input type="number" name="maxCollegeClass" id="" min="0" onChange={this.handleChange} />
                    </div>
                    {/* high schools */}
                    <div className="row">
                        <label htmlFor="currentHighSchool">High Schools</label>
                        <input type="text" name="currentHighSchool" id="" value={this.state.currentHighSchool} onChange={this.handleChange} className="current-hs"/>
                        <button type="submit" onClick={this.addHighSchool}
                            disabled={!this.state.currentHighSchool.match(/^([\w\-\,\.]+\s*)+$/g)} className="btn-add-hs">Add High School</button>
                    </div>
                    <div className="high-school-list">
                        {
                            [...this.state.highSchools].map((highSchool) => {
                                return (
                                    <div key={highSchool} className="high-school-unit">
                                        <h5 className="high-school-name">{highSchool}</h5>
                                        <button onClick={this.removeHighSchool}>Remove High School</button>
                                    </div>
                                );
                            })
                        }
                    </div>
                    <div className="row">
                        <label htmlFor="appStatuses">Application Statuses:</label>
                        <input type="checkbox" name="pending" id="" onChange={this.handleAppStatuses} />
                        <label htmlFor="pending">Pending</label>
                        <input type="checkbox" name="accepted" id="" onChange={this.handleAppStatuses} />
                        <label htmlFor="accepted">Accepted</label>
                        <input type="checkbox" name="denied" id="" onChange={this.handleAppStatuses} />
                        <label htmlFor="denied">Denied</label>
                        <input type="checkbox" name="deferred" id="" onChange={this.handleAppStatuses} />
                        <label htmlFor="deferred">Deferred</label>
                        <input type="checkbox" name="wait-listed" id="" onChange={this.handleAppStatuses} />
                        <label htmlFor="wait-listed">Wait-listed</label>
                        <input type="checkbox" name="withdrawn" id="" onChange={this.handleAppStatuses} />
                        <label htmlFor="withdrawn">Withdrawn</label>
                    </div>
                    <button onClick={this.filter} className="btn-filter">Apply Filters</button>
                    <label htmlFor="scatterplot">Scatterplot: </label>
                    <input type="checkbox" name="scatterplot" id="" onChange={this.toggleScatterplot} checked={this.state.scatterplot} />
                </div>
                {
                    this.state.scatterplot ?
                        <Scatterplot students={this.state.students} college={this.props.college}/> :
                    <div className="student-list">
                        {this.state.students.map((student) => <AppTrackerItem key={student._id} student={student} />)}
                    </div>
                }
            </div>
        );
    }
}

function isInt(n) {  //copied from https://stackoverflow.com/questions/5630123/javascript-string-integer-comparisons
    return /^[+-]?\d+$/.test(n);
};