import React from 'react';
import "./index.css"
import axios from 'axios'

export default class Login extends React.Component{
    state={
        err:"",
        username:"",
        password:""
    }

    handleInputChange = (e) => {
        const { target } = e;
        this.setState(state => ({
          [target.name]: target.value,
        }));
    }

    login = (event)=>{
        event.preventDefault();
        let user = {username:this.state.username, password:this.state.password}
        axios.post("/api/login", user).then(res=>{
            this.props.history.push("/blah");
        }).catch(err=>{
            this.setState({err:"Incorrect username or password"})
        });
    }

    componentDidMount(){
        this.setState({err:"", email:"", username:"", password:""});
    }

    render(){
        return(
            <form>
                <h3>Login Here</h3>
                <label htmlFor="username">Username:</label>
                <input name="username" onChange={this.handleInputChange}/>
                <br/>
                <br/>
                <label htmlFor="password">Password:</label>
                <input type="password" name="password"onChange={this.handleInputChange}/>
                <br/>
                <br/>
                <button onClick={this.login} >Login</button>
                <br/>
                <br/>
                <span style={{color:"red"}}>{this.state.err}
                <br/>
                <br/></span>
            </form>
        )
    }
}