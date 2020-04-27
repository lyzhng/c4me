import React from 'react';
import Axios from 'axios';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Toast from 'react-bootstrap/Toast';
import ToastHeader from 'react-bootstrap/ToastHeader';
import ToastBody from 'react-bootstrap/ToastBody';
import { Redirect } from 'react-router-dom';

function isInt(n) {  //copied from https://stackoverflow.com/questions/5630123/javascript-string-integer-comparisons
    return /^[+-]?\d+$/.test(n);
};

const states = ['AL', 'AK', 'AS', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FM', 'FL', 'GA', 'GU', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MH', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'MP', 'OH', 'OK', 'OR', 'PW', 'PA', 'PR', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VI', 'VA', 'WA', 'WV', 'WI', 'WY'];



export default class Highschools extends React.Component {
    state = {
        name: "",
        city: "",
        state: "al",
        highschools: [],
        show: false,
    };

    setShow = () => {
        this.setState({ show: false });
    }

    handleChange = (e) => {
        this.setState({
          [e.target.name]: isInt(e.target.value) ? parseInt(e.target.value) : e.target.value,
        }, this.setStateDefault);
    }
    findHighSchools = async (e) => {
        e.preventDefault();
        const query = {
            name: this.state.name.toLowerCase(),
            city: this.state.city.toLowerCase(),
            state: this.state.state
        }
        try {
            const resp = await Axios.post("/calculateSimilarHighschools", query);
            if (resp.data.highschools.length == 0) {
                this.setState({ highschools: resp.data.highschools, show: true });
            }
            else {
                this.setState({ highschools: resp.data.highschools, show: false });
            }
        } catch (e) {
            console.log("Something went wrong in the backend");
        }
        
    }
    render() {
        if (this.props.userid) {
            return (
                <>
                <Toast onClose={this.setShow} show={this.state.show} delay={3000} autohide>
                    <Toast.Header>
                        <strong className="mr-auto">Error</strong>
                    </Toast.Header>
                    <Toast.Body>Could not find the highschool you entered in our database. Please try again</Toast.Body>
                </Toast>
                <div className="container">
                    <h1>Find Similar Highschools</h1>
                    <br/>
                    <Form>
                        <Row>
                            <Col>
                                <Form.Label>Highschool Name:</Form.Label>
                                <Form.Control placeholder="Name" onChange={this.handleChange} name="name"/>
                            </Col>
                            <Col>
                                <Form.Label>Highschool City:</Form.Label>
                                <Form.Control placeholder="City" onChange={this.handleChange} name="city"/>
                            </Col>
                            <Col>
                                <Form.Label>Highschool State:</Form.Label>
                                <Form.Control as='select' onChange={this.handleChange} name="state">
                                    {states.map(state => {
                                        return <option key={state} value={state.toLowerCase()}>{state}</option>
                                    })}
                                </Form.Control>
                            </Col>
                        <Button type="submit" variant="outline-secondary" onClick={this.findHighSchools}>Search for Highschools</Button>
                        </Row>
                    </Form>
                    <br/>
                    <div>
                        {this.state.highschools.length == 0 ? null :
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>Rank #</th>
                                        <th>Highschool</th>
                                        <th>Similarity Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.state.highschools.map((hs ,i) => { return <tr key={hs.highschool._id}><td>{i + 1}</td><td>{hs.highschool.name.toUpperCase()}</td><td>{hs.score}</td></tr> })}
                                </tbody>
                            </Table>
                        }
                    </div>
                    </div>
            </>
            );
        }
        return <Redirect to="/login" />;
    }
}