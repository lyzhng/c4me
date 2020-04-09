import React from 'react';
import {Redirect} from 'react-router-dom';
import Axios from 'axios';

export default class Profile extends React.Component{

  state = {
    user : {
      userid: "",
      password: "",
      SAT_math: [],
      SAT_ebrw: [],
      SAT_literature: [],
      SAT_math_I: [],
      SAT_math_II: [],
      SAT_US_hist:[],
      SAT_world_hist: [],
      SAT_eco_bio: [],
      SAT_mol_bio: [],
      ACT_English: [],
      ACT_math: [],
      ACT_reading: [],
      ACT_composite: [],
      location: "",
      major_1: "",
      major_2: "",
      college_class: "",
      num_AP_passed: "",
      high_school_city: "",
      high_school_state: "",
      high_school_name: "",
      applications: [],
    }
  };
  
  componentDidMount(){
    //console.log("MY PROFILE HELLO???");
    Axios.get("/getUser", {userId : this.props.userid}).then((resp)=>{
      console.log(resp.data);
      console.log(123);
      this.setState({user : resp.data.user});
    })
  }

  render(){
    console.log(this.props);
    if(this.props.userid){
    return(
        <div>
          <h1>User ID: {this.props.match.params.userid}</h1>
          {/*<form>*/}
          {/*  <label>*/}
          {/*    Email:*/}
          {/*    <input type = "text" value = {this.state.user.email}/>*/}
          {/*  </label>*/}
          {/*</form>*/}
        </div>
    )
    }
    else{
    return <Redirect to = "/login" />
    }
  }
}