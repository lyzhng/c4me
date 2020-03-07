import React from 'react';
import "./index.css"
import axios from "axios";

export default class Register extends React.Component{
    state={
        err: "",
        username: "",
        email: "",
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
        let newUser = {username: this.state.username,
                        email: this.state.email,
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
        this.setState({err:"", email:"", username:"", password:""});
    }

    render(){
        return(
            <form>
                <h3>Sign Up Page</h3>
                <label htmlFor="username">Username:</label>
                <input type="text" name = "username" onChange={this.handleInputChange}/>
                <br/>
                <br/>
                <label htmlFor="email">Email:</label>
                <input type="email" type="email" name="email" onChange={this.handleInputChange}/>
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
            </form>
        )
    }
}