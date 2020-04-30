import React from 'react';
import {Redirect ,BrowserRouter} from 'react-router-dom';
import Axios from 'axios';
import { Button} from 'react-bootstrap';
import { Modal } from "react-bootstrap";

export default class Profile extends React.Component{

  state = {
    isReadOnlyApplication: true,
    showApplications: false,
    gradeModel : false,
    btnState : "Edit",
    disabled : true,
    userid: "",
    password: "",
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

  userDefaultState =(user)=> {
    this.setState({
      userid : user.userid,
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

  async componentDidMount() {
    Axios.post("/getuser", { userId: this.props.userid }).then((resp) => {
      this.userDefaultState(resp.data.user);
    });
    await this.getApplications();
  }

  edit = (event) =>{
    this.setState({disabled : false});
    this.setState({btnState : "save"});
  };

  studentInfoSave = (event)=>{
    this.setState({disabled : true});
    this.setState({btnState : "edit"});
    Axios.post("/setStudentInfo", {user : this.state}).then((resp) =>{
      if (resp.data.msg !== undefined){
        alert(resp.data.msg);
      }
      console.log(resp.data.err);
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

  handleChange(e){
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

  handleAPChange(e){
    if (e.target.value >=  0  && e.target.value <= 9999 )
      this.setState({[e.target.name] : e.target.value});
    else
      alert("Invalid input for number of AP pass");
  }

  getApplications = async () => {
    const resp = await Axios.post('/getapplications', { query: this.props.userid });
    this.setState({ applications: resp.data.applications });
    console.log('Get Applications');
    console.log(this.state.applications)
  }

  handleApplicationChange = async (e, applicationId) => {
    const applications = this.state.applications.map((application) => { return Object.assign({}, application) });
    const status = document.querySelector(`#status-${applicationId}`).value;
    const resp = await Axios.post('/updateapplication', { applicationId, status });
    const updatedApplication = resp.data.application;
    for (let i = 0; i < applications.length; i++) {
      console.log(applications[i]);
      if (applications[i]._id === applicationId) {
        console.log('target hit!');
        applications[i] = updatedApplication;
      }
    }
    this.setState({ applications: [...applications] });
    console.log('Handle Application Change');
    console.log(this.state.applications);
  }

  handleEditOrSaveButton = (e, applicationId) => {
    if (!applicationId) {
      this.addNewApplication();
      this.setState({ isReadOnlyApplication: !this.state.isReadOnlyApplication });
      return;
    }
    if (!this.state.isReadOnlyApplication) {
      this.handleApplicationChange(e, applicationId);
    }
    this.setState({ isReadOnlyApplication: !this.state.isReadOnlyApplication });
  }

  addNewApplication = async () => {
    await Axios.post('/addapplication', { userid: this.props.userid })
  }

  appendPrompt = () => {
  }

  render(){
    if(this.props.userid){
      return (
        <div className={`container my-2`}>
          <h1>User ID: {this.state.userid}</h1>
          <form>
            <div class="form-group">
              <label className="col-sm-2 text-center">Password: </label>
              <input type = "Password"
                     className= "col-sm-2"
                     name = "password"
                     value={(this.state.password != null) ? this.state.password : ""}
                     disabled={(this.state.disabled)? "disabled" :""}
                     onChange={(e) => this.handleChange(e)}
              />
                <span className="ml-4">
                <Button className="btn" onClick = {(this.state.btnState === "edit")? this.edit : this.studentInfoSave } > {this.state.btnState}</Button>
              </span>
            </div>
            <div className="form-group">
              <label className="col-sm-2 text-center"> residence_state : </label>
              <input type = "text"
                     className = "col-sm-2"
                     name = "residence_state"
                     value = {(this.state.residence_state != null) ? this.state.residence_state : ""}
                     placeholder = {"Fill Your Profile"}
                     disabled = {(this.state.disabled)? "disabled" :""}
                     onChange={(e) => this.handleChange(e)}
              />
            </div>
            <div class="form-group">
              <label className="col-sm-2 text-center"> High School : </label>
              <input type = "text"
                     class = "col-sm-2"
                     name = "high_school_name"
                     value = {(this.state.high_school_name != null) ? this.state.high_school_name : ""}
                     disabled = {(this.state.disabled)? "disabled" :""}
                     placeholder = {"Fill Your Profile"}
                     onChange={(e) => this.handleChange(e)}
              />
            </div>
            <div className="form-group">
              <label className="col-sm-2 text-center"> High School City: </label>
              <input type="text"
                     className = "col-sm-2"
                     name="high_school_city"
                     value={(this.state.high_school_city != null) ? this.state.high_school_city : ""}
                     disabled={(this.state.disabled) ? "disabled" : ""}
                     placeholder={"Fill Your Profile"}
                     onChange={(e) => this.handleChange(e)}
              />
            </div>
            <div class="form-group">
              <label class="col-sm-2 text-center"> High School State: </label>
              <input type="text"
                     class = "col-sm-2"
                     name="high_school_state"
                     value={(this.state.high_school_state != null) ? this.state.high_school_state : ""}
                     disabled={(this.state.disabled) ? "disabled" : ""}
                     placeholder={"Fill Your Profile"}
                     onChange={(e) => this.handleChange(e)}
              />
            </div>
            <div class="form-group">
              <label class="col-sm-2 text-center"> Major 1 : </label>
              <input type = "text"
                     class = "col-sm-2"
                     name = "major_1"
                     value={(this.state.major_1 != null) ? this.state.major_1 : ""}
                     disabled={(this.state.disabled)? "disabled" :""}
                     placeholder = {"Fill Your Profile"}
                     onChange={(e) => this.handleChange(e)}
              />
            </div>
            <div class="form-group">
              <label class="col-sm-2 text-center"> Major 2 : </label>
              <input type = "text"
                     class = "col-sm-2"
                     name="major_2"
                     value={(this.state.major_2 != null) ? this.state.major_2 : ""}
                     disabled={(this.state.disabled)? "disabled" :""}
                     placeholder = {"Fill Your Profile"}
                     onChange={(e) => this.handleChange(e)}
              />
            </div>
            <div class="form-group">
              <label class="col-sm-2 text-center"> College Classes : </label>
              <input type = "number"
                     class = "col-sm-2"
                     name = "college_class"
                     value={(this.state.college_class != null) ? this.state.college_class : ""}
                     disabled={(this.state.disabled)? "disabled" :""}
                     placeholder = {"Fill Your Profile"}
                     onChange={(e) => this.handleAPChange(e)}
              />
            </div>
            <div class="form-group">
              <label class="col-sm-2 text-center"> Number of AP Passed : </label>
              <input type = "number"
                     class = "col-sm-2"
                     name = "num_AP_passed"
                     value={(this.state.num_AP_passed != null) ? this.state.num_AP_passed : ""}
                     disabled={(this.state.disabled)? "disabled" :""}
                     placeholder = {"Fill Your Profile"}
                     onChange={(e) => this.handleAPChange(e)}
              />
            </div>

          </form>

          <Button variant="primary" onClick={(e)=> this.gradeHandleShow(e)}>
          View Scores
          </Button>
        <Button variant="primary" onClick={() => this.setState({ showApplications: true })}>
          View Applications  
        </Button>

          <Modal size="xl" show={this.state.gradeModel} onHide={(e)=> this.gradeHandleShow(e)}>
            <Modal.Header closeButton onClick={(e)=> this.gradHandleClose(e)} >
              <Modal.Title>Test Scores</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div class="form-group">
                <label class = "col-sm-3"> SAT_math : </label>
                <input type = "text"
                       name = "SAT_math"
                       value={(this.state.SAT_math != null) ? this.state.SAT_math : ""}
                       placeholder = {"Fill Your Profile"}
                       onChange={(e) => this.handleSATChange(e)}
                />
                <label class = "col-sm-3 ml-5"> SAT_EBRW : </label>
                <input type = "text"
                       name = "SAT_EBRW"
                       value={(this.state.SAT_EBRW != null) ? this.state.SAT_EBRW : ""}
                       placeholder = {"Fill Your Profile"}
                       onChange={(e) => this.handleSATChange(e)}
                />
              </div>
              <div class="form-group">
                <label class = "col-sm-3"> SAT_eco_bio : </label>
                <input type = "text"
                       name = "SAT_eco_bio"
                       value={(this.state.SAT_eco_bio != null) ? this.state.SAT_eco_bio : ""}
                       placeholder = {"Fill Your Profile"}
                       onChange={(e) => this.handleSATChange(e)}
                />
                <label class = "col-sm-3 ml-5"> SAT_literature : </label>
                <input type = " text"
                       name = "SAT_literature"
                       value={(this.state.SAT_literature != null) ? this.state.SAT_literature : ""}
                       placeholder = {"Fill Your Profile"}
                       onChange={(e) => this.handleSATChange(e)}
                />
              </div>
              <div class="form-group">
                <label class = "col-sm-3"> SAT_math_I : </label>
                <input type = "text"
                       name = "SAT_math_I"
                       value={(this.state.SAT_math_I != null) ? this.state.SAT_math_I : ""}
                       placeholder = {"Fill Your Profile"}
                       onChange={(e) => this.handleSATChange(e)}
                />
                <label class = "col-sm-3 ml-5"> SAT_math_II : </label>
                <input type = "text"
                       name = "SAT_math_II"
                       value={(this.state.SAT_math_II != null) ? this.state.SAT_math_II : ""}
                       placeholder = {"Fill Your Profile"}
                       onChange={(e) => this.handleSATChange(e)}
                />
              </div>
              <div class="form-group">
                <label class = "col-sm-3"> SAT_mol_bio : </label>
                <input type = "text"
                       name = "SAT_mol_bio"
                       value={(this.state.SAT_mol_bio != null) ? this.state.SAT_mol_bio : ""}
                       placeholder = {"Fill Your Profile"}
                       onChange={(e) => this.handleSATChange(e)}
                />
                <label class = "col-sm-3 ml-5"> SAT_US_hist : </label>
                <input type = "text"
                       name = "SAT_US_hist"
                       value={(this.state.SAT_US_hist != null) ? this.state.SAT_US_hist : ""}
                       placeholder = {"Fill Your Profile"}
                       onChange={(e) => this.handleSATChange(e)}
                />
              </div>

              <div class="form-group">
                <label class = "col-sm-3"> ACT_composite : </label>
                <input type = "text"
                       name = "ACT_composite"
                       value={(this.state.ACT_composite != null) ? this.state.ACT_composite : ""}
                       placeholder = {"Fill Your Profile"}
                       onChange={(e) => this.handleACTChange(e)}
                />
                <label class = "col-sm-3 ml-5"> ACT_English : </label>
                <input type = "text"
                       name = "ACT_English"
                       value={(this.state.ACT_English != null) ? this.state.ACT_English : ""}
                       placeholder = {"Fill Your Profile"}
                       onChange={(e) => this.handleACTChange(e)}
                />
              </div>

              <div class="form-group">
                <label class = "col-sm-3"> ACT_math : </label>
                <input type = "text"
                       name = "ACT_math"
                       value={(this.state.ACT_math != null) ? this.state.ACT_math : ""}
                       placeholder = {"Fill Your Profile"}
                       onChange={(e) => this.handleACTChange(e)}
                />
                <label class = "col-sm-3 ml-5"> ACT_reading : </label>
                <input type = "text"
                       name = "ACT_reading"
                       value={(this.state.ACT_reading != null) ? this.state.ACT_reading : ""}
                       placeholder = {"Fill Your Profile"}
                       onChange={(e) => this.handleACTChange(e)}
                />
              </div>

            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={(e)=> this.gradHandleClose(e)}>
                Close
              </Button>
              <Button name='saveBtn' variant="primary" onClick={(e)=> this.studentInfoSave(e)}>
                Save Changes
              </Button>
            </Modal.Footer>
        </Modal>
        <Modal size="xl" show={this.state.showApplications} onHide={() => this.setState({ showApplications: false })}>
          <Modal.Header closeButton onClick={() => this.setState({ showApplications: false })} >
            <Modal.Title>Applications</Modal.Title>
          </Modal.Header>
          <Modal.Body>
          {
              this.state.applications.map((application) => {
                return (
                  <div key={application}>
                    <h2 style={{ color: "#222222" }}>{application.college}</h2><span> </span>
                    <select 
                      id={`status-${application._id}`}
                      disabled={this.state.isReadOnlyApplication}
                      defaultValue={application.status}>
                      <option value="pending" >Pending</option>
                      <option value="accepted">Accepted</option>
                      <option value="denied">Denied</option>
                      <option value="deferred">Deferred</option>
                      <option value="wait-listed">Wait-listed</option>
                      <option value="withdrawn">Withdrawn</option>
                    </select>
                    <span> </span>
                    <Button
                      variant="outline-primary"
                      onClick={(e) => this.handleEditOrSaveButton(e, application._id)}
                      value={this.state.isReadOnlyApplication ? 'Edit Application' : 'Save Changes'}>
                      {this.state.isReadOnlyApplication ? 'Edit Application' : 'Save Changes'}
                    </Button>
                  </div>
                )
              })
            }
            <div className="new-applications">
              
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button name='saveBtn' variant="primary" onClick={this.appendPrompt}>
              Add New Application
            </Button>
            <Button variant="secondary" onClick={() => this.setState({ showApplications: false })}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
        </div>
    )
    }
    return <Redirect to = "/login" />
  }
}
