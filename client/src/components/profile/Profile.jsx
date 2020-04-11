import React from 'react';
import {Redirect} from 'react-router-dom';
import Axios from 'axios';
import { Button} from 'react-bootstrap';
import { Modal } from "react-bootstrap";

export default class Profile extends React.Component{

  state = {
    gradeModel : false,
    btnState : "edit",
    disabled : true,
    userid: "",
    password: "",
    SAT_math: "",
    SAT_ebrw: "",
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
    location: "",
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
      SAT_ebrw: user.SAT_ebrw,
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
      location: user.location,
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
    Axios.post("/getuser", { userId: this.props.userid }).then((resp) => {
      this.userDefaultState(resp.data.user);
    });
  }

  edit = (event) =>{
    this.setState({disabled : false});
    this.setState({btnState : "save"});
  };

  studentInfoSave = (event)=>{
    console.log(this.state.location);
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

  render(){
    if(this.props.userid){
    return(
        <div>
          <h1>User ID: {this.state.userid}</h1>
          <form>
            <div>
              <label> Password : </label>
              <input type = "Password"
                     name = "password"
                     value={(this.state.password != null) ? this.state.password : ""}
                     disabled={(this.state.disabled)? "disabled" :""}
                     onChange={(e) => this.handleChange(e)}
              />
              <span>
                <Button variant="link" onClick = {(this.state.btnState === "edit")? this.edit : this.studentInfoSave } > {this.state.btnState}</Button>
              </span>
            </div>
            <div>
              <label> Location : </label>
              <input type = "text"
                     name = "location"
                     value = {(this.state.location != null) ? this.state.location : ""}
                     placeholder = {"Fill Your Profile"}
                     disabled = {(this.state.disabled)? "disabled" :""}
                     onChange={(e) => this.handleChange(e)}
              />
            </div>
            <div>
              <label> High School : </label>
              <input type = "text"
                     name = "high_school_name"
                     value = {(this.state.high_school_name != null) ? this.state.high_school_name : ""}
                     disabled = {(this.state.disabled)? "disabled" :""}
                     placeholder = {"Fill Your Profile"}
                     onChange={(e) => this.handleChange(e)}
              />
            </div>
            <div>
              <label> High School City: </label>
              <input type="text"
                     name="high_school_city"
                     value={(this.state.high_school_city != null) ? this.state.high_school_city : ""}
                     disabled={(this.state.disabled) ? "disabled" : ""}
                     placeholder={"Fill Your Profile"}
                     onChange={(e) => this.handleChange(e)}
              />
            </div>
            <div>
              <label> High School State: </label>
              <input type="text"
                     name="high_school_state"
                     value={(this.state.high_school_state != null) ? this.state.high_school_state : ""}
                     disabled={(this.state.disabled) ? "disabled" : ""}
                     placeholder={"Fill Your Profile"}
                     onChange={(e) => this.handleChange(e)}
              />
            </div>
            <div>
              <label> Major 1 : </label>
              <input type = "text"
                     name = "major_1"
                     value={(this.state.major_1 != null) ? this.state.major_1 : ""}
                     disabled={(this.state.disabled)? "disabled" :""}
                     placeholder = {"Fill Your Profile"}
                     onChange={(e) => this.handleChange(e)}
              />
            </div>
            <div>
              <label> Major 2 : </label>
              <input type = "text"
                     name="major_2"
                     value={(this.state.major_2 != null) ? this.state.major_2 : ""}
                     disabled={(this.state.disabled)? "disabled" :""}
                     placeholder = {"Fill Your Profile"}
                     onChange={(e) => this.handleChange(e)}
              />
            </div>
            <div>
              <label> College Classes : </label>
              <input type = "text"
                     name = "college_class"
                     value={(this.state.college_class != null) ? this.state.college_class : ""}
                     disabled={(this.state.disabled)? "disabled" :""}
                     placeholder = {"Fill Your Profile"}
                     onChange={(e) => this.handleChange(e)}
              />
            </div>
            <div>
              <label> Number of AP Passed : </label>
              <input type = "text"
                     name = "num_AP_passed"
                     value={(this.state.num_AP_passed != null) ? this.state.num_AP_passed : ""}
                     disabled={(this.state.disabled)? "disabled" :""}
                     placeholder = {"Fill Your Profile"}
                     onChange={(e) => this.handleChange(e)}
              />
            </div>

          </form>

          <Button variant="primary" onClick={(e)=> this.gradeHandleShow(e)}>
            View Scores
          </Button>

          <Modal size="lg" show={this.state.gradeModel} onHide={(e)=> this.gradeHandleShow(e)}>
            <Modal.Header closeButton onClick={(e)=> this.gradHandleClose(e)} >
              <Modal.Title>Test Scores</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div>
                <label> SAT_math : </label>
                <input type = "text"
                       name = "SAT_math"
                       value={(this.state.SAT_math != null) ? this.state.SAT_math : ""}
                       placeholder = {"Fill Your Profile"}
                       onChange={(e) => this.handleChange(e)}
                />
                <label> SAT_ebrw : </label>
                <input type = "text"
                       name = "SAT_ebrw"
                       value={(this.state.SAT_ebrw != null) ? this.state.SAT_ebrw : ""}
                       placeholder = {"Fill Your Profile"}
                       onChange={(e) => this.handleChange(e)}
                />
              </div>
              <div>
                <label> SAT_eco_bio : </label>
                <input type = "text"
                       name = "SAT_eco_bio"
                       value={(this.state.SAT_eco_bio != null) ? this.state.SAT_eco_bio : ""}
                       placeholder = {"Fill Your Profile"}
                       onChange={(e) => this.handleChange(e)}
                />
                <label> SAT_literature : </label>
                <input type = "text"
                       name = "SAT_literature"
                       value={(this.state.SAT_literature != null) ? this.state.SAT_literature : ""}
                       placeholder = {"Fill Your Profile"}
                       onChange={(e) => this.handleChange(e)}
                />
              </div>
              <div>
                <label> SAT_math_I : </label>
                <input type = "text"
                       name = "SAT_math_I"
                       value={(this.state.SAT_math_I != null) ? this.state.SAT_math_I : ""}
                       placeholder = {"Fill Your Profile"}
                       onChange={(e) => this.handleChange(e)}
                />
                <label> SAT_math_II : </label>
                <input type = "text"
                       name = "SAT_math_II"
                       value={(this.state.SAT_math_II != null) ? this.state.SAT_math_II : ""}
                       placeholder = {"Fill Your Profile"}
                       onChange={(e) => this.handleChange(e)}
                />
              </div>
              <div>
                <label> SAT_mol_bio : </label>
                <input type = "text"
                       name = "SAT_mol_bio"
                       value={(this.state.SAT_mol_bio != null) ? this.state.SAT_mol_bio : ""}
                       placeholder = {"Fill Your Profile"}
                       onChange={(e) => this.handleChange(e)}
                />
                <label> SAT_US_hist : </label>
                <input type = "text"
                       name = "SAT_US_hist"
                       value={(this.state.SAT_US_hist != null) ? this.state.SAT_US_hist : ""}
                       placeholder = {"Fill Your Profile"}
                       onChange={(e) => this.handleChange(e)}
                />
              </div>

              <div>
                <label> ACT_composite : </label>
                <input type = "text"
                       name = "ACT_composite"
                       value={(this.state.ACT_composite != null) ? this.state.ACT_composite : ""}
                       placeholder = {"Fill Your Profile"}
                       onChange={(e) => this.handleChange(e)}
                />
                <label> ACT_English : </label>
                <input type = "text"
                       name = "ACT_English"
                       value={(this.state.ACT_English != null) ? this.state.ACT_English : ""}
                       placeholder = {"Fill Your Profile"}
                       onChange={(e) => this.handleChange(e)}
                />
              </div>

              <div>
                <label> ACT_math : </label>
                <input type = "text"
                       name = "ACT_math"
                       value={(this.state.ACT_math != null) ? this.state.ACT_math : ""}
                       placeholder = {"Fill Your Profile"}
                       onChange={(e) => this.handleChange(e)}
                />
                <label> ACT_reading : </label>
                <input type = "text"
                       name = "ACT_reading"
                       value={(this.state.ACT_reading != null) ? this.state.ACT_reading : ""}
                       placeholder = {"Fill Your Profile"}
                       onChange={(e) => this.handleChange(e)}
                />
              </div>

            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={(e)=> this.gradHandleClose(e)}>
                Close
              </Button>
              <Button variant="primary" onClick={(e)=> this.studentInfoSave(e)}>
                Save Changes
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
    )
    }
    return <Redirect to = "/login" />
  }
}