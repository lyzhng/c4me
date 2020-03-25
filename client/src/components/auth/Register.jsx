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
                <div>
                <div>
                    <h3>Sign Up Page</h3>
                    <label htmlFor="userid"> userid:</label>
                    <input type="text" name = "userid" onChange={this.handleInputChange}/>
                    <br/>
                    <br/>
                    <label htmlFor="password">Password:</label>
                    <input type="password" name="password" onChange={this.handleInputChange}/>
                    <br/>
                    <br/>
                    <button onClick = {this.register} >Register</button>
                    <br/>
                    <br/>
                    <span style={{color:"red"}}>{this.state.err}
                    <br/>
                    <br/></span>
                </div>
                <Link to = "/login">Login Here</Link>
                </div>
            )
        }
        else{
           return <Redirect to = "/" />
        }
    }
}