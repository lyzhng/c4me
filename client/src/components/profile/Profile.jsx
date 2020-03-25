import React from 'react';
import {Redirect} from 'react-router-dom';
import Axios from 'axios';

export default class Profile extends React.Component{

  state = {

  }
  
  componentDidMount(){
    console.log("MY PROFILE HELLO???");
    Axios.get("/getuser/" + this.props.userid)
  }

  render(){
    console.log(this.props);
    if(this.props.userid){
    return(
       <h1>User ID: {this.props.match.params.userid}</h1>

    )
    }
    else{
    return <Redirect to = "/login" />
    }
  }
}