import React from 'react';
import {Redirect ,BrowserRouter} from 'react-router-dom';
import Axios from 'axios';
import { Modal, Button, Form, Col } from "react-bootstrap";
import { MdRemoveCircle } from 'react-icons/md';

const states = ['AL', 'AK', 'AS', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FM', 'FL', 'GA', 'GU', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MH', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'MP', 'OH', 'OK', 'OR', 'PW', 'PA', 'PR', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VI', 'VA', 'WA', 'WV', 'WI', 'WY'];
export default class Profile extends React.Component{

  state = {
    promptedStatus: 'no-option',
    promptedCollege: 'no-option',
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
    statusTracker: {}
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
    this.setState({btnState : "Save"});
  };

  studentInfoSave = (event)=>{
    this.setState({disabled : true});
    this.setState({ btnState: "Edit"});
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

  handleAPChange(e){
    if (e.target.value >=  0  && e.target.value <= 9999 )
      this.setState({[e.target.name] : e.target.value});
    else
      alert("Invalid input for number of AP pass");
  }

  hideApplicationModal = () => {
    this.setState({ showApplications: false });
    this.clearPrompts();
  }

  getApplications = async () => {
    const resp = await Axios.post('/getapplications', { query: this.props.userid });
    this.setState({ applications: resp.data.applications });
    const statusTracker = {};
    for (const a of this.state.applications) {
      statusTracker[a._id] = {
        status: a.status,
        collegeName: a.college,
      }
    }
    this.setState({ statusTracker });
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
      promptedCollege: 'no-option',
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
                <Button className="btn" onClick = {(this.state.btnState === "Edit")? this.edit : this.studentInfoSave } > {this.state.btnState}</Button>
              </span>
            </div>
            <div className="form-group">
              <label className="col-sm-2 text-center"> Residence State : </label>
              <select className="col-sm-2" name="residence_state" disabled={(this.state.disabled) ? "disabled" : ""}
                onChange={(e) => this.handleChange(e)}
              >
                {states.map(state => {
                  return state.toLowerCase() === this.state.residence_state ? <option key={state} value={state.toLowerCase()} selected>{state}</option> : <option key={state} value={state.toLowerCase()}>{state}</option>
                })}
              </select>
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
              <select className="col-sm-2" name="high_school_state" disabled={(this.state.disabled) ? "disabled" : ""}
                onChange={(e) => this.handleChange(e)}
              >
                {states.map(state => {
                  return state.toLowerCase() === this.state.high_school_state ? <option key={state} value={state.toLowerCase()} selected>{state}</option> : <option key={state} value={state.toLowerCase()}>{state}</option>
                })}
              </select>
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
          <Button
            variant="primary"
            onClick={() => this.setState({ showApplications: true })}
            className={`mx-2`}>
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
                      <Form.Group>
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
                      <Form.Control
                        as="select"
                        name="promptedCollege"
                        value={this.state.promptedCollege}
                        onChange={(e) => this.handleChange(e)}
                        className={!this.isDuplicateApp() ? '' : 'is-invalid'}>
                        <option value="no-option">Choose a college for your application.</option>
                        <option value="American University">American University</option>
                        <option value="Barnard College">Barnard College</option>
                        <option value="Berry College">Berry College</option>
                        <option value="California State University, East Bay">California State University, East Bay</option>
                        <option value="California State University, Fresno">California State University, Fresno</option>
                        <option value="California State University, Monterey Bay">California State University, Monterey Bay</option>
                        <option value="Campbell University">Campbell University</option>
                        <option value="Carnegie Mellon University">Carnegie Mellon University</option>
                        <option value="Central Connecticut State University">Central Connecticut State University</option>
                        <option value="Centre College">Centre College</option>
                        <option value="Clarkson University">Clarkson University</option>
                        <option value="Colgate University">Colgate University</option>
                        <option value="Colorado College">Colorado College</option>
                        <option value="DePaul University">DePaul University</option>
                        <option value="DePauw University">DePauw University</option>
                        <option value="Drake University">Drake University</option>
                        <option value="Drexel University">Drexel University</option>
                        <option value="Eastern Illinois University">Eastern Illinois University</option>
                        <option value="Eastern Washington University">Eastern Washington University</option>
                        <option value="Florida Gulf Coast University">Florida Gulf Coast University</option>
                        <option value="Fordham University">Fordham University</option>
                        <option value="Franklin & Marshall College">Franklin & Marshall College</option>
                        <option value="Gannon University">Gannon University</option>
                        <option value="Gettysburg College">Gettysburg College</option>
                        <option value="Gordon College">Gordon College</option>
                        <option value="Hendrix College">Hendrix College</option>
                        <option value="Hope College">Hope College</option>
                        <option value="Idaho State University">Idaho State University</option>
                        <option value="Illinois College">Illinois College</option>
                        <option value="Indiana University Bloomington">Indiana University Bloomington</option>
                        <option value="Iona College">Iona College</option>
                        <option value="John Carroll University">John Carroll University</option>
                        <option value="Kalamazoo College">Kalamazoo College</option>
                        <option value="Kennesaw State University">Kennesaw State University</option>
                        <option value="Lawrence Technological University">Lawrence Technological University</option>
                        <option value="Manhattan College">Manhattan College</option>
                        <option value="Massachusetts Institute of Technology">Massachusetts Institute of Technology</option>
                        <option value="Mercer University">Mercer University</option>
                        <option value="Merrimack College">Merrimack College</option>
                        <option value="Mississippi State University">Mississippi State University</option>
                        <option value="Missouri University of Science and Technology">Missouri University of Science and Technology</option>
                        <option value="Moravian College">Moravian College</option>
                        <option value="Mount Holyoke College">Mount Holyoke College</option>
                        <option value="New Jersey Institute of Technology">New Jersey Institute of Technology</option>
                        <option value="New York University">New York University</option>
                        <option value="North Park University">North Park University</option>
                        <option value="Northwestern University">Northwestern University</option>
                        <option value="Nova Southeastern University">Nova Southeastern University</option>
                        <option value="Princeton University">Princeton University</option>
                        <option value="Providence College">Providence College</option>
                        <option value="Reed College">Reed College</option>
                        <option value="Rice University">Rice University</option>
                        <option value="Rider University">Rider University</option>
                        <option value="Rochester Institute of Technology">Rochester Institute of Technology</option>
                        <option value="Roger Williams University">Roger Williams University</option>
                        <option value="SUNY College of Environmental Science and Forestry">SUNY College of Environmental Science and Forestry</option>
                        <option value="Saint Louis University">Saint Louis University</option>
                        <option value="Salve Regina University">Salve Regina University</option>
                        <option value="Samford University">Samford University</option>
                        <option value="San Diego State University">San Diego State University</option>
                        <option value="School of the Art Institute of Chicago">School of the Art Institute of Chicago</option>
                        <option value="Siena College">Siena College</option>
                        <option value="Smith College">Smith College</option>
                        <option value="St Bonaventure University">St Bonaventure University</option>
                        <option value="Stevenson University">Stevenson University</option>
                        <option value="Stony Brook University">Stony Brook University</option>
                        <option value="Suffolk University">Suffolk University</option>
                        <option value="Temple University">Temple University</option>
                        <option value="Texas Christian University">Texas Christian University</option>
                        <option value="Texas Tech University">Texas Tech University</option>
                        <option value="The College of St Scholastica">The College of St Scholastica</option>
                        <option value="The College of Wooster">The College of Wooster</option>
                        <option value="Transylvania University">Transylvania University</option>
                        <option value="University of Alabama">University of Alabama</option>
                        <option value="University of Alabama at Birmingham">University of Alabama at Birmingham</option>
                        <option value="University of Arizona">University of Arizona</option>
                        <option value="University of Arkansas">University of Arkansas</option>
                        <option value="University of California, Davis">University of California, Davis</option>
                        <option value="University of California, Santa Barbara">University of California, Santa Barbara</option>
                        <option value="University of California, Santa Cruz">University of California, Santa Cruz</option>
                        <option value="University of Central Florida">University of Central Florida</option>
                        <option value="University of Delaware">University of Delaware</option>
                        <option value="University of Hartford">University of Hartford</option>
                        <option value="University of Houston">University of Houston</option>
                        <option value="University of Illinois at Chicago">University of Illinois at Chicago</option>
                        <option value="University of Kentucky">University of Kentucky</option>
                        <option value="University of Maine">University of Maine</option>
                        <option value="University of Massachusetts Amherst">University of Massachusetts Amherst</option>
                        <option value="University of Montana">University of Montana</option>
                        <option value="University of Nevada, Las Vegas">University of Nevada, Las Vegas</option>
                        <option value="University of Nevada, Reno">University of Nevada, Reno</option>
                        <option value="University of Richmond">University of Richmond</option>
                        <option value="University of San Diego">University of San Diego</option>
                        <option value="University of Utah">University of Utah</option>
                        <option value="Utah State University">Utah State University</option>
                        <option value="Vassar College">Vassar College</option>
                        <option value="Wagner College">Wagner College</option>
                        <option value="Washington & Jefferson College">Washington & Jefferson College</option>
                        <option value="Westmont College">Westmont College</option>
                        <option value="William Jewell College">William Jewell College</option>
                        <option value="Williams College">Williams College</option>
                      </Form.Control>
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
                disabled={this.state.promptedCollege === 'no-option' || this.state.promptedStatus === 'no-option' || this.isDuplicateApp()}>
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
