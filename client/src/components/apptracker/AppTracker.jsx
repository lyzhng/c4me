import React from 'react';
import Axios from 'axios';
// import { Redirect } from 'react-router-dom';
import AppTrackerItem from './AppTrackerItem';
import Scatterplot from './Scatterplot.jsx';

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
            scatterplot: false
        };
    }

    setDefaultState = (e) => {
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

    filter = async (e) => {
        e.preventDefault();
        const students = this.state.students;
        for (let i = 0; i < students.length; i++) {
            const appFitsReq = await this.appFitsReq(students[i]);
            const fitsCriteria = appFitsReq && this.highSchoolFitsReq(students[i]) && this.collegeClassFitsReq(students[i]);
            console.log('appFitsReq', appFitsReq);
            console.log('highSchoolFitsReq', this.highSchoolFitsReq(students[i]));
            console.log('collegeClassFitsReq', this.collegeClassFitsReq(students[i]));
            students[i].hidden = fitsCriteria ? false : true;
        }
        this.setState({ students: students });
    }

    collegeClassFitsReq = (student) => {
        const collegeClass = student.college_class;
        const { minCollegeClass, maxCollegeClass } = this.state;
        console.log('college class', collegeClass);
        console.log('min college class', minCollegeClass);
        console.log('max college class', maxCollegeClass);
        return minCollegeClass <= collegeClass && collegeClass <= maxCollegeClass;
    }
    
    highSchoolFitsReq = (student) => {
        const highSchool = student.high_school_name;
        const { highSchools } = this.state;
        return highSchools.size === 0 || highSchools.has(highSchool); // might have to make it less specific
    }

    appFitsReq = async (student) => {
        if (this.props.college) {
            const collegeName = this.props.college.name;
            const {
                appStatuses
            } = this.state;
            try {
                const resp = await Axios.post('/appstatusreq', {
                    student: student,
                    collegeName: collegeName,
                    statuses: appStatuses,
                });
                for (let i = 0; i < this.state.students.length; i++) {
                    if (this.state.students[i].userid == resp.data.student.userid) {
                        this.state.students[i] = resp.data.student;
                    }
                }
                this.setState({ students: this.state.students });
                return !resp.data.student.hidden;
            } catch (err) {
                console.error(err);
            }
        }
        return false;
    }

    addHighSchool = (e) => {
        console.log('Adding high school:', this.state.currentHighSchool);
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
            console.log('College prop was passed in.');
            const collegeName = this.props.college.name;
            const resp = await Axios.post('/retrievestudents', { query: collegeName });
            this.setState({ students: resp.data.students });
            console.log('Students:', this.state.students);
        }
    }

    toggleScatterplot = (e) => {
        this.setState({ scatterplot: !this.state.scatterplot });
    }

    // need college's name thru path or UI
    render() {
        return (
            <div>
                <div className="filters">
                    <h1>App Tracker Component</h1>
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
                        <input type="text" name="currentHighSchool" id="" onChange={this.handleChange} />
                        <button type="submit" onClick={this.addHighSchool}
                            disabled={this.state.currentHighSchool.match(/(\s*[A-Za-z0-9\-\_\,\.]\s*)+/g) ? '' : 'disabled'}>Add High School</button>
                    </div>
                    <div className="high-school-list">
                        {
                            [...this.state.highSchools].map((highSchool) => {
                                return (
                                    <div className="high-school-unit">
                                        <h1 className="high-school-name">{highSchool}</h1>
                                        <button onClick={this.removeHighSchool}>Remove High School</button>
                                    </div>
                                );
                            })
                        }
                    </div>
                    {/* application statuses */}
                    <div className="row">
                        <label htmlFor="appStatuses">Application Statuses</label>
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
                    <button onClick={this.filter}>Apply Filters</button>
                    Scatterplot: <input type="checkbox" name="scatterplot" id="" onChange={this.toggleScatterplot} checked={this.state.scatterplot}/>
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