import React from 'react';
import { Redirect } from 'react-router-dom';
import Axios from 'axios';
import { Button } from 'react-bootstrap';
import { Modal } from "react-bootstrap";

export default class Profile extends React.Component {

    state = {
        gradeModel: false,
        disabled: true,
        userid: "",
        SAT_math: "",
        SAT_EBRW: "",
        SAT_literature: "",
        SAT_math_I: "",
        SAT_math_II: "",
        SAT_US_hist: "",
        SAT_world_hist: "",
        SAT_eco_bio: "",
        SAT_mol_bio: "",
        ACT_English: "",
        ACT_math: "",
        ACT_reading: "",
        ACT_composite: "",
        residence_state: "",
        major_1: "",
        major_2: "",
        college_class: "",
        num_AP_passed: "",
        high_school_city: "",
        high_school_state: "",
        high_school_name: "",
        applications: [],
    };

    userDefaultState = (user) => {
        this.setState({
            userid: user.userid,
            password: user.password,
            SAT_math: user.SAT_math,
            SAT_EBRW: user.SAT_EBRW,
            SAT_literature: user.SAT_literature,
            SAT_math_I: user.SAT_math_I,
            SAT_math_II: user.SAT_math_II,
            SAT_US_hist: user.SAT_US_hist,
            SAT_world_hist: user.SAT_world_hist,
            SAT_eco_bio: user.SAT_eco_bio,
            SAT_mol_bio: user.SAT_mol_bio,
            ACT_English: user.ACT_English,
            ACT_math: user.ACT_math,
            ACT_reading: user.ACT_reading,
            ACT_composite: user.ACT_composite,
            residence_state: user.residence_state,
            major_1: user.major_1,
            major_2: user.major_2,
            college_class: user.college_class,
            num_AP_passed: user.num_AP_passed,
            high_school_city: user.high_school_city,
            high_school_state: user.high_school_state,
            high_school_name: user.high_school_name,
            applications: user.applications,
        });
    };

    componentDidMount() {
        Axios.post("/getuser", { userId: this.props.match.params.userid }).then((resp) => {
            this.userDefaultState(resp.data.user);
        });
    }

    gradeHandleShow = (e) => {
        this.setState({ gradeModel: true });
    };

    gradHandleClose = (e) => {
        this.setState({ gradeModel: false });
    };

    handleChange(e) {
        this.setState({ [e.target.name]: e.target.value });
    }

    render() {
        if (this.props.userid) {
            return (
                <div className={`container my-2`}>
                    <h1>{this.state.userid}</h1>
                    <h4>residence_state: {(this.state.residence_state != null) ? this.state.residence_state : "N/A"}</h4>
                    <h4>High School: {(this.state.high_school_name != null) ? this.state.high_school_name : "N/A"}</h4>
                    <h4>High School Location:
                        {(this.state.high_school_city != null) ? this.state.high_school_city : "N/A"},
                        {(this.state.high_school_state != null) ? this.state.high_school_state : "N/A"}
                    </h4>
                    <h4>Major 1: {(this.state.major_1 != null) ? this.state.major_1 : "N/A"}</h4>
                    <h4>Major 2: {(this.state.major_2 != null) ? this.state.major_2 : "N/A"}</h4>
                    <h4>College Classes: {(this.state.college_class != null) ? this.state.college_class : "N/A"}</h4>
                    <h4>Number of APs passed: {(this.state.num_AP_passed != null) ? this.state.num_AP_passed : "N/A"}</h4>
                    <Button variant="primary" onClick={(e) => this.gradeHandleShow(e)}>View Scores</Button>
                    <Modal size="lg" show={this.state.gradeModel} onHide={(e) => this.gradeHandleShow(e)}>
                        <Modal.Header closeButton onClick={(e) => this.gradHandleClose(e)} >
                            <Modal.Title>Test Scores</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <div>
                                <h4>SAT Math: {(this.state.SAT_math != null) ? this.state.SAT_math : "N/A"}</h4>
                                <h4> SAT EBRW: {(this.state.SAT_EBRW != null) ? this.state.SAT_EBRW : "N/A"}</h4>
                            </div>
                            <div>
                                <h4>SAT Eco Bio: {(this.state.SAT_eco_bio != null) ? this.state.SAT_eco_bio : "N/A"}</h4>
                                <h4>SAT Literature: {(this.state.SAT_literature != null) ? this.state.SAT_literature : "N/A"}</h4>
                            </div>
                            <div>
                                <h4>SAT Math 1: {(this.state.SAT_math_I != null) ? this.state.SAT_math_I : "N/A"} </h4>
                                <h4>SAT Math 2: {(this.state.SAT_math_II != null) ? this.state.SAT_math_II : "N/A"}</h4>
                            </div>
                            <div>
                                <h4>SAT Mol Bio: {(this.state.SAT_mol_bio != null) ? this.state.SAT_mol_bio : "N/A"}</h4>
                                <h4>SAT US History: {(this.state.SAT_US_hist != null) ? this.state.SAT_US_hist : "N/A"}</h4>
                            </div>
                            <div>
                                <h4>ACT Composite: {(this.state.ACT_composite != null) ? this.state.ACT_composite : "N/A"}</h4>
                                <h4>ACT English: {(this.state.ACT_English != null) ? this.state.ACT_English : "N/A"}</h4>
                            </div>
                            <div>
                                <h4>ACT Math: {(this.state.ACT_math != null) ? this.state.ACT_math : "N/A"}</h4>
                                <h4>ACT Reading: {(this.state.ACT_reading != null) ? this.state.ACT_reading : ""}</h4>
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={(e) => this.gradHandleClose(e)}>Close</Button>
                        </Modal.Footer>
                    </Modal>
                </div>
            )
        }
        return <Redirect to="/login" />
    }
}
