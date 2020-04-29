import React from 'react';
import "./index.css"
import axios from "axios";
import {Redirect, Link} from 'react-router-dom';

export default class Register extends React.Component{
    state={
        err: "",
        userid: "",
        password:"",

    }

    handleInputChange = (e) => {
        const { target } = e;
        this.setState(state => ({
          [target.name]: target.value,
        }));
      }

    register = (event)=>{
        event.preventDefault();
        let newUser = { userid: this.state.userid,
                        password: this.state.password};
        console.log(newUser)
        axios.post("/api/register", newUser).then(res=>{
                this.props.history.push("/login");
        }).catch(err => {
            this.setState({err: "Userid is already taken!"})
        });
    }

    componentDidMount(){
        this.setState({err:"", email:"",  userid:"", password:""});
    }

    render(){
        if(!this.props.userid){
            return(
              <div className="wrapper">
                  <div id="formContent">
                      <h3>Sign Up Page</h3>
                      <form>
                          <input type="text" id="login" className="second loginStyle"
                                 name = "userid" onChange = {this.handleInputChange}
                                 placeholder="username"/>
                          <input type="password" id="password" className="third loginStyle"
                                 name = "password" onChange = {this.handleInputChange}
                                 placeholder="password"/>
                          <input type="submit"
                                 className="fourth" value="Register"
                                 onClick = {this.register}/>
                      </form>

                      <span style = {{color:"red"}}>{this.state.err}
                          <br/><br/>
                      </span>
                  </div>
              </div>
            )
        }
        else{
           return <Redirect to = "/" />
        }
    }
}
