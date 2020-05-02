import React from 'react';
import Axios from 'axios';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Toast from 'react-bootstrap/Toast';
import Autocomplete from "react-autocomplete";
import { Redirect } from 'react-router-dom';

function isInt(n) {  //copied from https://stackoverflow.com/questions/5630123/javascript-string-integer-comparisons
    return /^[+-]?\d+$/.test(n);
};

const states = ['AL', 'AK', 'AS', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FM', 'FL', 'GA', 'GU', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MH', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'MP', 'OH', 'OK', 'OR', 'PW', 'PA', 'PR', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VI', 'VA', 'WA', 'WV', 'WI', 'WY'];
const hs_name = [];


export default class Highschools extends React.Component {
    state = {
        name: "",
        city: "",
        state: "",
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
            state: this.state.state.toLowerCase()
			}
        try {
            let resp = await Axios.post("/calculateSimilarHighschools", query);
            if (resp.data.highschools.length == 0) {
                try {
                    const resp2 = await Axios.post("/importahs", query);
                    resp = await Axios.post("/calculateSimilarHighschools", query);
                    if (resp.data.highschools.length == 0) {
                        console.log("NOT WORKING :(");
                        this.setState({ highschools: resp.data.highschools, show: true });
                    }
                    else {
                        this.setState({ highschools: resp.data.highschools, show: false });
                    }
                } catch (e) {
                    console.log(e);
                    this.setState({ highschools: resp.data.highschools, show: true });
                }
            }
            else {
                this.setState({ highschools: resp.data.highschools, show: false });
            }
        } catch (e) {
            console.log(e);
        }

    }

  autocompleteHS= (e)=>{
      console.log(e);
      const result = hs_name.find(hs_name =>hs_name.label === e);
      console.log(result);
      this.setState( {name: result.label , state: result.state, city : result.city })
    };

    async componentDidMount() {
        Axios.post("/getallhighschools").then((resp) => {
          console.log(resp.data.highschools.length);
          for (let i = 0; resp.data.highschools.length > i; i++) {
            hs_name.push({
              id: i,
              label: resp.data.highschools[i].name,
              city: resp.data.highschools[i].city,
              state: resp.data.highschools[i].state,
            });
          }
        });
    }

    render() {
        if (this.props.userid) {
            return (
              <>
                <Toast
                  onClose={this.setShow}
                  show={this.state.show}
                  delay={3000}
                  autohide
                >
                  <Toast.Header>
                    <strong className="mr-auto">Error</strong>
                  </Toast.Header>
                  <Toast.Body>
                    Could not find the highschool you entered in our database.
                    Please try again
                  </Toast.Body>
                </Toast>
                <div className="container">
                  <h1>Find Similar Highschools</h1>
                  <br />
                  <Form>
                    <Row>
                      <Col>
                        <Form.Label>Highschool Name:</Form.Label>
                        <Autocomplete
                          items={hs_name}
                          shouldItemRender={(item, value) =>
                            item.label
                              .toLowerCase()
                              .indexOf(value.toLowerCase()) > -1
                          }
                          getItemValue={(item) => item.label}
                          renderItem={(item, highlighted) => (
                            <div
                              key={item.id}
                              style={{
                                backgroundColor: highlighted
                                  ? "#eee"
                                  : "transparent",
                              }}
                            >
                              {item.label}
                            </div>
                          )}
                          value={this.state.name}
                          inputProps={{
                            placeholder: "High School Name",
                            style: {
                              boxSizing: "border-box",
                              display: "block",
                              width: "100%",
                              fontSize: "1rem",
                              lineHeight: "1.5",
                              border: "1px solid #ced4da",
                              padding: ".375rem .75rem",
                              fontWeight: "400",
                              height: "calc(1.5em + .75rem + 2px)",
                              backgroundClip: "padding-box",
                              borderRadius: ".25rem"
                            },
                          }}
                          onChange={(e) =>
                            this.setState({ name: e.target.value })
                          }
                          onSelect={(value) => this.autocompleteHS(value)}
                          wrapperStyle={{
                            position: "relative",
                            zIndex: 1,
                            display: "inline",
                          }}
                        />
                      </Col>
                      <Col>
                        <Form.Label>Highschool City:</Form.Label>
                        <Form.Control
                          placeholder="City"
                          onChange={this.handleChange}
                          value={this.state.city}
                          name="city"
                        />
                      </Col>
                      <Col>
                        <Form.Label>Highschool State:</Form.Label>
                        <Form.Control
                          as="select"
                          onChange={this.handleChange}
                          value={this.state.state}
                          name="state"
                        >
                          <option value={""}>No State Selected</option>
                          {states.map((state) => {
                            return (
                              <option key={state} value={state.toLowerCase()}>
                                {state}
                              </option>
                            );
                          })}
                        </Form.Control>
                      </Col>
                      <Button
                        type="submit"
                        variant="outline-secondary"
                        onClick={this.findHighSchools}
                        style={{ height: "50px", marginTop: "20px" }}
                      >
                        Search
                      </Button>
                    </Row>
                  </Form>
                  <br />
                  <div>
                    {this.state.highschools.length == 0 ? null : (
                      <Table striped bordered hover>
                        <thead>
                          <tr>
                            <th>Rank #</th>
                            <th>Highschool</th>
                            <th>Similarity Score</th>
                          </tr>
                        </thead>
                        <tbody>
                          {this.state.highschools.map((hs, i) => {
                            return (
                              <tr key={hs.highschool._id}>
                                <td>{i + 1}</td>
                                <td>
                                  {hs.highschool.name.toUpperCase() +
                                    ", " +
                                    hs.highschool.city.toUpperCase() +
                                    ", " +
                                    hs.highschool.state.toUpperCase()}
                                </td>
                                <td>{hs.score.toFixed(3)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </Table>
                    )}
                  </div>
                </div>
              </>
            );
        }
        return <Redirect to="/login" />;
    }
}
