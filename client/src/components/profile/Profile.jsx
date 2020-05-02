import React from 'react';
import {Redirect ,BrowserRouter} from 'react-router-dom';
import Axios from 'axios';
import { Modal, Button, Form, Col } from "react-bootstrap";
import { MdRemoveCircle } from 'react-icons/md';
import Autocomplete  from 'react-autocomplete'

const states = ['AL', 'AK', 'AS', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FM', 'FL', 'GA', 'GU', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MH', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'MP', 'OH', 'OK', 'OR', 'PW', 'PA', 'PR', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VI', 'VA', 'WA', 'WV', 'WI', 'WY'];
const hs_name = [];
let collegeNames = [];

export default class Profile extends React.Component{

  state = {
    promptedStatus: 'no-option',
    promptedCollege: '',
    isReadOnlyApplication: true,
    showApplications: false,
    gradeModel : false,
    btnState : "Edit",
    disabled : true,
    userid: "",
    password: "",
    GPA:"",
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
    statusTracker: {}
  };

  userDefaultState =(user)=> {
    this.setState({
      userid : user.userid,
      password: user.password,
      GPA: user.GPA,
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
    });
  };

  async componentDidMount() {
    Axios.post("/getuser", { userId: this.props.userid }).then((resp) => {
      this.userDefaultState(resp.data.user);
    });
    Axios.post("/getallhighschools").then((resp)=> {
      for (let i = 0 ; resp.data.highschools.length > i; i++){
        if (resp.data.highschools[i].name !== null ){
          hs_name.push(
            {id : i ,
              label : resp.data.highschools[i].name,
              city : resp.data.highschools[i].city,
              state : resp.data.highschools[i].state
            }
          )
        }
      }
    });
    const resp = await Axios.post('/getcollegenames');
    collegeNames = resp.data.collegeNames;
    await this.getApplications();
  }

  autocompleteHS= (e)=>{
      console.log(e);
      const result = hs_name.find(hs_name =>hs_name.label === e);
      console.log(result);
      this.setState( {high_school_name: result.label , high_school_state: result.state, high_school_city : result.city })
  };

  autocompleteCollege = (collegeName) => {
    console.log(collegeName);
    const result = collegeNames.find((name) => name === collegeName);
    this.setState({ promptedCollege: result });
  }

  edit = (event) =>{
    this.setState({disabled : false});
    this.setState({btnState : "Save"});
  };

  studentInfoSave = (event)=>{
    this.setState({disabled : true});
    this.setState({ btnState: "Edit"});
    console.log(this.state.major_2);
    Axios.post("/setStudentInfo", {user : this.state}).then((resp) =>{
      if (resp.data.msg !== undefined){
        alert(resp.data.msg);
      }
      if (resp.data.err !== undefined){
        alert(resp.data.err);
      }
    })
  };

  gradeHandleShow= (e)=>{
    this.setState({gradeModel:true});
  };

  gradHandleClose=(e) =>{
    this.setState({gradeModel:false});
  };

  handleChange(e) {
    this.setState({[e.target.name] : e.target.value});
  }

  handleSATChange(e){
    if (e.target.value >=  0  && e.target.value <= 800 )
      this.setState({[e.target.name] : e.target.value});
    else
      alert("Invalid input for SAT Score ");
  }

  handleACTChange(e){
    if (e.target.value >=  0  && e.target.value <= 36 )
      this.setState({[e.target.name] : e.target.value});
    else
      alert("Invalid input for ACT Score ");
  }

  handleGPAChange(e){
    if (e.target.value >=  0  && e.target.value <= 4 )
      this.setState({[e.target.name] : e.target.value});
    else
      alert("Invalid input for number of GPA");
  }
  handleAPChange(e){
    if (e.target.value >=  0  && e.target.value <= 9999 )
      this.setState({[e.target.name] : e.target.value});
    else
      alert("Invalid input for number");
  }

  hideApplicationModal = () => {
    this.setState({ showApplications: false });
    this.clearPrompts();
  }

  getApplications = async () => {
    const resp = await Axios.post('/getapplications', { query: this.props.userid });
    const statusTracker = {};
    for (const a of resp.data.applications) {
      statusTracker[a._id] = {
        status: a.status,
        collegeName: a.college,
      };
    }
    this.setState({ applications: resp.data.applications, statusTracker });
  }

  updateApplications = async () => {
    console.log('Update Applications');
    const resp =await Axios.post('/updateapplications', {
      statusTracker: this.state.statusTracker,
      userid: this.props.userid,
    });
    this.setState({ applications: resp.data.applications });
  }

  handleEditOrSaveButton = async (e) => {
    if (e.target.value === 'Save Changes') {
      await this.updateApplications();
    }
    this.setState({ isReadOnlyApplication: !this.state.isReadOnlyApplication });
  }



  handleAppUpdate = (_id, collegeName, status) => {
    const ids = Object.keys(this.state.statusTracker);
    for (const k of ids) {
      console.log('k', k);
      if (k === _id) {
        this.state.statusTracker[k] = {
          status: status,
          collegeName: collegeName,
        };
      }
    }
    this.setState({ statusTracker: this.state.statusTracker });
    console.log(this.state.statusTracker);
  }

  isDuplicateApp = () => {
    return this.state.applications.some((app) => app.college === this.state.promptedCollege);
  }

  addApplication = async () => {
    // if (this.state.applications.some((app) => app.college === this.state.promptedCollege)) {
    //   // show a toast!
    //   console.log('The application to that college already exists.');
    //   this.clearPrompts();
    //   return;
    // }


    const resp = await Axios.post('/addapplication', {
      userid: this.props.userid,
      college: this.state.promptedCollege,
      status: this.state.promptedStatus,
      applications: this.state.applications,
      statusTracker: this.state.statusTracker
    });

    this.setState({
      applications: resp.data.applications,
      statusTracker: resp.data.statusTracker,
    });

    console.log('Clearing prompt...')
    this.clearPrompts();
  }

  clearPrompts = () => {
    this.setState({
      promptedCollege: '',
      promptedStatus: 'no-option'
    });
  }

  deleteApplication = async (_id) => {
    const resp = await Axios.post('/deleteapplication', {
      userid: this.props.userid,
      applications: this.state.applications,
      statusTracker: this.state.statusTracker,
      _id,
    });
    console.log('Updated Applications:', resp.data.applications);
    this.setState({
      applications: resp.data.applications,
      statusTracker: resp.data.statusTracker,
    });
  }

  render(){
    if(this.props.userid){
      return (
        <div className={`container my-2`}>
          <div className="edit-profile" style={{borderRadius:"10px"}}>
          <h1>User ID: {this.state.userid}</h1>
          <form>
            <div class="form-group ">
              <Form.Row className="justify-content-center">
              <label className="ml-5 col-sm-2 ">Password: </label>
              <Form.Control type = "Password"
                     className= "ml-4 col-sm-2"
                     name = "password"
                     value={(this.state.password != null) ? this.state.password : ""}
                     disabled={(this.state.disabled)? "disabled" :""}
                     onChange={(e) => this.handleChange(e)}
              />
                <span className="ml-4">
                <Button className="btn" onClick = {(this.state.btnState === "Edit")? this.edit : this.studentInfoSave } > {this.state.btnState}</Button>
                </span>
              </Form.Row>
            </div>
            <div className="form-group">
              <label className="col-sm-2 "> Residence State : </label>
              <select className="col-sm-2" name="residence_state" disabled={(this.state.disabled) ? "disabled" : ""}
                onChange={(e) => this.handleChange(e)}
              >
                {states.map(state => {
                  return state.toLowerCase() === this.state.residence_state ? <option key={state} value={state.toLowerCase()} selected>{state}</option> : <option key={state} value={state.toLowerCase()}>{state}</option>
                })}
              </select>
            </div>
            <div class="form-group">
              <Form.Row className="justify-content-center">
              <label className="col-sm-2 "> High School : </label>
              <Autocomplete
                items= {hs_name}
                shouldItemRender={(item, value) => value ? item.label.toLowerCase().indexOf(value.toLowerCase()) > -1 : 0}
                getItemValue={item => item.label}
                //getOptionLabel={(item) => item.title}
                renderItem={(item, highlighted) =>
                  <div
                    key={item.id}
                    style={{ backgroundColor: highlighted ? '#eee' : 'transparent'}}
                  >
                    {item.label}
                  </div>
                }
                inputProps={{disabled : (this.state.disabled)? "disabled" :"",
                  placeholder:"Fill in profile",
                  style: {
                    boxSizing: "border-box",
                    display: "block",
                    width: "100%",
                    fontSize: "1rem",
                    color: "#495057",
                    lineHeight: "1.5",
                    border: "1px solid #ced4da",
                    padding: ".375rem .75rem",
                    fontWeight: "400",
                    height: "calc(1.5em + .75rem + 2px)",
                    backgroundClip: "padding-box",
                    borderRadius: ".25rem"
                  }}}
                value={this.state.high_school_name}
                onChange={e => this.setState({ high_school_name : e.target.value })}
                onSelect={value => this.autocompleteHS(value)}
                wrapperStyle={{position:"relative", zIndex:1, display: "inline"}}
              />
              </Form.Row>
            </div>
            <div className="form-group">
              <Form.Row className="justify-content-center">
              <label className="col-sm-2"> High School City: </label>
              <Form.Control type="text"
                     className = "col-sm-2"
                     name="high_school_city"
                     value={(this.state.high_school_city != null) ? this.state.high_school_city : ""}
                     disabled={(this.state.disabled) ? "disabled" : ""}
                     onChange={(e) => this.handleChange(e)}
              />
              </Form.Row>
            </div>
            <div class="form-group">
              <label class="col-sm-2"> High School State: </label>
              <select className="col-sm-2" name="high_school_state" disabled={(this.state.disabled) ? "disabled" : ""}
                onChange={(e) => this.handleChange(e)}
              >
                {states.map(state => {
                  return state.toLowerCase() === this.state.high_school_state ? <option key={state} value={state.toLowerCase()} selected>{state}</option> : <option key={state} value={state.toLowerCase()}>{state}</option>
                })}
              </select>
            </div>
            <div className="form-group">
              <Form.Row className="justify-content-center">
              <label className="col-sm-2 "> Major 1 : </label>
              <Form.Control type = "text"
                            className = "col-sm-2"
                     name = "major_1"
                     value={(this.state.major_1 != null) ? this.state.major_1 : ""}
                     disabled={(this.state.disabled)? "disabled" :""}
                     onChange={(e) => this.handleChange(e)}
              />
              </Form.Row>
            </div>

            <div className="form-group">
              <Form.Row className="justify-content-center">
              <label className="col-sm-2 "> Major 2 : </label>
              <Form.Control type = "text"
                            className = "col-sm-2"
                     name="major_2"
                     value={(this.state.major_2 != null) ? this.state.major_2 : ""}
                     disabled={(this.state.disabled)? "disabled" :""}
                     onChange={(e) => this.handleChange(e)}
              />
              </Form.Row>
            </div>
            <div className="form-group">
              <Form.Row className="justify-content-center">
              <label className="col-sm-2"> GPA : </label>
              <Form.Control type="number"
                     className="col-sm-2"
                     name="GPA"
                     value={(this.state.GPA != null) ? this.state.GPA : ""}
                     disabled={(this.state.disabled) ? "disabled" : ""}
                     onChange={(e) => this.handleGPAChange(e)}
              />
              </Form.Row>
            </div>

            <div className="form-group">
              <Form.Row className="justify-content-center">
              <label className="col-sm-2 "> College Classes : </label>
              <Form.Control type = "number"
                            className = "col-sm-2"
                     name = "college_class"
                     value={(this.state.college_class != null) ? this.state.college_class : ""}
                     disabled={(this.state.disabled)? "disabled" :""}
                     onChange={(e) => this.handleAPChange(e)}
              />
              </Form.Row>
            </div>

            <div className="form-group">
              <Form.Row className="justify-content-center">
              <label className="col-sm-2 "> # of AP Passed : </label>
              <Form.Control type = "number"
                            className = "col-sm-2 text-left"
                     name = "num_AP_passed"
                     value={(this.state.num_AP_passed != null) ? this.state.num_AP_passed : ""}
                     disabled={(this.state.disabled)? "disabled" :""}
                     onChange={(e) => this.handleAPChange(e)}
              />
              </Form.Row>
            </div>

          </form>

          <Button variant="primary" onClick={(e)=> this.gradeHandleShow(e)}>
          View Scores
          </Button>
          <Button
            variant="primary"
            onClick={() => this.setState({ showApplications: true })}
            className={`mx-2`}>
          View Applications
        </Button>
          </div>

          <Modal size="xl" show={this.state.gradeModel} onHide={(e)=> this.gradeHandleShow(e)}>
            <Modal.Header closeButton onClick={(e)=> this.gradHandleClose(e)} >
              <Modal.Title>Test Scores</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div class="form-group">
                <label class = "col-sm-3">SAT Math</label>
                <input type = "text"
                       name = "SAT_math"
                       value={(this.state.SAT_math != null) ? this.state.SAT_math : ""}
                       onChange={(e) => this.handleSATChange(e)}
                />
                <label class = "col-sm-3 ml-5">SAT EBRW</label>
                <input type = "text"
                       name = "SAT_EBRW"
                       value={(this.state.SAT_EBRW != null) ? this.state.SAT_EBRW : ""}
                       onChange={(e) => this.handleSATChange(e)}
                />
              </div>
              <div class="form-group">
                <label class = "col-sm-3">SAT Eco Bio</label>
                <input type = "text"
                       name = "SAT_eco_bio"
                       value={(this.state.SAT_eco_bio != null) ? this.state.SAT_eco_bio : ""}
                       onChange={(e) => this.handleSATChange(e)}
                />
                <label class = "col-sm-3 ml-5">SAT Literature</label>
                <input type = " text"
                       name = "SAT_literature"
                       value={(this.state.SAT_literature != null) ? this.state.SAT_literature : ""}
                       onChange={(e) => this.handleSATChange(e)}
                />
              </div>
              <div class="form-group">
                <label class = "col-sm-3">SAT Math I</label>
                <input type = "text"
                       name = "SAT_math_I"
                       value={(this.state.SAT_math_I != null) ? this.state.SAT_math_I : ""}
                       onChange={(e) => this.handleSATChange(e)}
                />
                <label class = "col-sm-3 ml-5">SAT Math II</label>
                <input type = "text"
                       name = "SAT_math_II"
                       value={(this.state.SAT_math_II != null) ? this.state.SAT_math_II : ""}
                       onChange={(e) => this.handleSATChange(e)}
                />
              </div>
              <div class="form-group">
                <label class = "col-sm-3">SAT Mol Bio</label>
                <input type = "text"
                       name = "SAT_mol_bio"
                       value={(this.state.SAT_mol_bio != null) ? this.state.SAT_mol_bio : ""}
                       onChange={(e) => this.handleSATChange(e)}
                />
                <label class = "col-sm-3 ml-5">SAT US History</label>
                <input type = "text"
                       name = "SAT_US_hist"
                       value={(this.state.SAT_US_hist != null) ? this.state.SAT_US_hist : ""}
                       onChange={(e) => this.handleSATChange(e)}
                />
              </div>

              <div class="form-group">
                <label class = "col-sm-3">ACT Composite</label>
                <input type = "text"
                       name = "ACT_composite"
                       value={(this.state.ACT_composite != null) ? this.state.ACT_composite : ""}
                       onChange={(e) => this.handleACTChange(e)}
                />
                <label class = "col-sm-3 ml-5">ACT English</label>
                <input type = "text"
                       name = "ACT_English"
                       value={(this.state.ACT_English != null) ? this.state.ACT_English : ""}
                       onChange={(e) => this.handleACTChange(e)}
                  />
                </div>

              <div class="form-group">
                <label class = "col-sm-3">ACT Math</label>
                <input type = "text"
                       name = "ACT_math"
                       value={(this.state.ACT_math != null) ? this.state.ACT_math : ""}
                       onChange={(e) => this.handleACTChange(e)}
                />
                <label class = "col-sm-3 ml-5">ACT Reading</label>
                <input type = "text"
                       name = "ACT_reading"
                       value={(this.state.ACT_reading != null) ? this.state.ACT_reading : ""}
                       onChange={(e) => this.handleACTChange(e)}
                />
              </div>

            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={(e)=> this.gradHandleClose(e)}>
                Close
              </Button>
              <Button name='btn' variant="primary" onClick={(e)=> this.studentInfoSave(e)}>
                Save Changes
              </Button>
            </Modal.Footer>
        </Modal>
        <Modal size="xl" show={this.state.showApplications} onHide={this.hideApplicationModal}>
          <Modal.Header closeButton onClick={() => this.setState({ showApplications: false })} >
              <Modal.Title>
                <h1>Applications</h1>
                <h6 className={`text-muted`}>
                  Red and bolded indicates that the application is questionable and is held for review.
                </h6>
              </Modal.Title>
          </Modal.Header>
            <Modal.Body>
              <Form>
                {
                  this.state.applications.map((application) => {
                    return (
                      <Form.Group key={application._id}>
                        <Form.Row>
                          <Form.Label column className="text-justify">
                            <MdRemoveCircle
                              style={{ cursor: 'pointer' }}
                              onClick={() => this.deleteApplication(application._id)}
                              className={`mx-2`}/>
                            <span
                              style={{ fontWeight: application.questionable ? 'bold' : 'normal' }}
                              className={application.questionable ? 'text-danger': ''}>{application.college}</span>
                          </Form.Label>
                          <Col>
                            <Form.Control
                              as="select"
                              onChange={(e) => this.handleAppUpdate(application._id, application.college, e.target.value)}
                              name="application"
                              defaultValue={application.status}
                              disabled={this.state.isReadOnlyApplication}>
                              <option value="pending" >Pending</option>
                              <option value="accepted">Accepted</option>
                              <option value="denied">Denied</option>
                              <option value="deferred">Deferred</option>
                              <option value="wait-listed">Wait-listed</option>
                              <option value="withdrawn">Withdrawn</option>
                            </Form.Control>
                          </Col>
                        </Form.Row>
                      </Form.Group>
                    )
                  })
                }
                <Form.Group>
                  <Form.Row>
                    <Col>
                      <Autocomplete
                        items={collegeNames}
                        shouldItemRender={(item, value) => value ? item.toLowerCase().indexOf(value.toLowerCase()) > -1 : 0}
                        getItemValue={item => item}
                        inputProps={{
                          style: {
                            width: '100%',
                            height: '100%',
                            paddingLeft: '0.5rem',
                            paddingRight: '0.5rem',
                          },
                          placeholder: 'Enter a college name.',
                        }}
                        renderItem={(item, highlighted) => {
                          return (
                            <div
                              key={item}
                              style={{ backgroundColor: highlighted ? '#eee' : 'transparent' }}>
                              {item}
                            </div>
                          )
                        }}
                        value={this.state.promptedCollege}
                        onChange={(e) => this.setState({ promptedCollege: e.target.value })}
                        onSelect={value => this.autocompleteCollege(value)}
                        wrapperStyle={{ position: "relative", zIndex: 1, display: "inline" }}
                      />
                    </Col>
                    <Col>
                      <Form.Control
                        as="select"
                        name="promptedStatus"
                        onChange={(e) => this.handleChange(e)}
                        value={this.state.promptedStatus}>
                        <option value="no-option">Choose a status for your application.</option>
                        <option value="pending" >Pending</option>
                        <option value="accepted">Accepted</option>
                        <option value="denied">Denied</option>
                        <option value="deferred">Deferred</option>
                        <option value="wait-listed">Wait-listed</option>
                        <option value="withdrawn">Withdrawn</option>
                      </Form.Control>
                    </Col>
                  </Form.Row>
                </Form.Group>
              </Form>
          </Modal.Body>
            <Modal.Footer>
              <Button
                variant="outline-primary"
                onClick={(e) => this.handleEditOrSaveButton(e)}
                value={this.state.isReadOnlyApplication ? 'Edit Application' : 'Save Changes'}>
                {this.state.isReadOnlyApplication ? 'Edit Application' : 'Save Changes'}
              </Button>
              <Button
                name='saveBtn'
                variant="primary"
                onClick={this.addApplication}
                disabled={this.state.promptedCollege === '' || this.state.promptedStatus === 'no-option' || this.isDuplicateApp()}>
                Add New Application
            </Button>
          </Modal.Footer>
        </Modal>
        </div>
    )
    }
    return <Redirect to = "/login" />
  }
}
