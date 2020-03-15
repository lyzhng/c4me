import React from 'react';
import "./index.css"
import axios from "axios";

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
            if(res.data.status === "OK")
                this.props.history.push("/login");
            else
                this.setState({err: res.data.status});
        })
    }
    
    componentDidMount(){
        this.setState({err:"", email:"",  userid:"", password:""});
    }

    render(){
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
             <a href="/login">Login</a>
             </div>
        )
    }
}