import React from 'react';
import Axios from 'axios';
import { Form, Col, Button } from 'react-bootstrap';
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
            minCollegeClass: this.state.minCollegeClass === '' ? 0 : this.state.minCollegeClass,
            maxCollegeClass: this.state.maxCollegeClass === '' ? 3000 : this.state.maxCollegeClass,
        });
    }

    handleChange = (e) => {
        this.setState({
            [e.target.name]: (isInt(e.target.value) ? +e.target.value : e.target.value)
        }, this.setDefaultState);
    }

    filter = (e) => {
        if (e) {
            e.preventDefault();
        }
        const students = this.state.students;
        for (const s of students) {
            console.log('appfitsreq', this.appFitsReq(s));
            console.log('highschoolfitsreq', this.highSchoolFitsReq(s));
            console.log(this.state.minCollegeClass, s.college_class, this.state.maxCollegeClass);
            console.log('collegeclassfitsreq', this.collegeClassFitsReq(s));
            const fitsCriteria = this.appFitsReq(s) && this.highSchoolFitsReq(s) && this.collegeClassFitsReq(s);
            s.hidden = fitsCriteria ? false : true;
            console.log();
        }
        this.setState({ students: students, scatterplot: !this.state.scatterplot }, () => {
            this.setState({ scatterplot: !this.state.scatterplot });
        });
    }

    collegeClassFitsReq = (student) => {
        const collegeClass = student.college_class;
        // console.log(student.college_class);
        const { minCollegeClass, maxCollegeClass } = this.state;
        return minCollegeClass <= collegeClass && collegeClass <= maxCollegeClass;
    }
    
    highSchoolFitsReq = (student) => {
        const highSchool = student.high_school_name.toLowerCase().trim();
        const { highSchools } = this.state;
        return highSchool && (highSchools.size === 0 || highSchools.has(highSchool)); // might have to make it less specific
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

    stylizeHoveredText = (e) => {
        const targetName = e.target.getAttribute('name');
        document.querySelector(`span[name="${targetName}"]`).style.fontWeight = '800';
    }

    resetStyle = (e) => {
        const targetName = e.target.getAttribute('name');
        document.querySelector(`span[name="${targetName}"]`).style.fontWeight = '400';
    }

    addHighSchool = () => {
        this.setState({ highSchools: new Set([...this.state.highSchools, this.state.currentHighSchool.toLowerCase().trim()]) });
        this.setState({ currentHighSchool: '' })
    }

    removeHighSchool = (e) => {
        const { highSchools } = this.state;
        const targetName = e.target.getAttribute('name');
        highSchools.delete(targetName);
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
                    <h2 className="mb-4">App Tracker for {this.props.college.name}</h2>
                    <Form>
                        <Form.Group>
                            <Form.Row>
                                <Form.Label column lg="3">Minimum College Class</Form.Label>
                                <Col>
                                    <Form.Control
                                        className="form-control"
                                        title="Enter the minimum college class for the lower bound filter."
                                        name="minCollegeClass"
                                        type="tel"
                                        min="0"
                                        pattern="[1-2][0-9][0-9][0-9]"
                                        autoComplete="off"
                                        onChange={this.handleChange} />
                                </Col>
                            </Form.Row>
                        </Form.Group>
                        <Form.Group>
                            <Form.Row>
                                <Form.Label column lg="3">Maximum College Class</Form.Label>
                                <Col>
                                    <Form.Control
                                        className="form-control"
                                        title="Enter the maximum college class for the upper bound filter."
                                        name="maxCollegeClass"
                                        type="tel"
                                        min="0"
                                        pattern="[1-2][0-9][0-9][0-9]"
                                        autoComplete="off"
                                        onChange={this.handleChange} />
                                </Col>
                            </Form.Row>
                        </Form.Group>
                        <Form.Group>
                            <Form.Row>
                                <Form.Label column lg="3">High Schools</Form.Label>
                                <Col>
                                    <Form.Control
                                        type="text"
                                        name="currentHighSchool"
                                        value={this.state.currentHighSchool}
                                        onChange={this.handleChange}
                                        className="current-hs" />
                                </Col>
                                <Button
                                    size="sm"
                                    variant="outline-primary"
                                    type="button"
                                    onClick={this.addHighSchool}
                                    disabled={!String(this.state.currentHighSchool).match(/^([\w\-,.]+\s*)+$/g)}
                                    className="btn-add-hs"
                                >Add High School</Button>
                            </Form.Row>
                            <Form.Text>
                                <div className="high-school-list">
                                    Filtering: [<span> </span>
                                    {
                                        [...this.state.highSchools].map((highSchool) => {
                                            return (
                                                <div key={highSchool} style={{ display: "inline" }}>
                                                    <span
                                                        name={highSchool}
                                                        className="high-school-unit"
                                                        onMouseEnter={this.stylizeHoveredText}
                                                        onClick={this.removeHighSchool}
                                                        onMouseLeave={this.resetStyle}
                                                    >{highSchool}</span>
                                                    <span> </span>
                                                </div>
                                            );
                                        })
                                    }
                                    <span> </span>]
                                </div>
                            </Form.Text>
                            <Form.Text className="text-muted">To remove a high school from your filter, simply click on the name.</Form.Text>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Application Statuses</Form.Label>
                            <Col>
                            {
                                ['Pending', 'Accepted', 'Denied', 'Deferred', 'Wait-listed', 'Withdrawn'].map((status) => {
                                    return (
                                        <Form.Check
                                            inline
                                            key={status}
                                            type="checkbox"
                                            label={status}
                                            name={status.toLowerCase()}
                                            onChange={this.handleAppStatuses}
                                        />
                                    )
                                })
                                }
                            </Col>
                        </Form.Group>
                        <div className="buttons">
                            <Button
                                size="sm"
                                variant="primary"
                                type="submit"
                                onClick={this.filter}
                                className="btn-filter"
                            >Apply Filters</Button>
                            <Button
                                size="sm"
                                variant="outline-dark"
                                name="scatterplot"
                                type="button"
                                onClick={this.toggleScatterplot}
                                checked={this.state.scatterplot}
                                className="ml-2"
                            >{this.state.scatterplot ? 'View List' : 'View Scatterplot'}
                            </Button>
                        </div>
                    </Form>
                </div>
                {
                    this.state.scatterplot ?
                        <div className="mt-4">
                            <Scatterplot students={this.state.students} college={this.props.college} />
                        </div> :
                        <div className="student-list mt-4">
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