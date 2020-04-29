import React from 'react';
import "./index.css"
import axios from 'axios'
import {Redirect, Link} from 'react-router-dom';

export default class Login extends React.Component{
    state={
        err:"",
        userid:"",
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
        let user = { userid:this.state.userid, password:this.state.password}
        axios.post("/api/login", user).then(res=>{
					console.log(res.data);
					if(res.data.userid === "admin"){
						window.location.href = "/admin";
					}
					else{
					window.location.href = "/";
					}
        }).catch(err=>{
            this.setState({err:"Incorrect  userid or password"})
        });
    }

    componentDidMount(){
        this.setState({err:"", email:"",  userid:"", password:""});
    }

    render(){
			if(!this.props.userid){
				return(
					<div className="wrapper fadeInDown">
						<div id="formContent">
							<h3>Login Here</h3>
							<form>
								<input type="text" id="login" className="fadeIn second loginStyle"
									   name = "userid" onChange = {this.handleInputChange}
									   placeholder="username"/>
								<input type="password" id="password" className="fadeIn third loginStyle"
									   name = "password" onChange = {this.handleInputChange}
									   placeholder="password"/>
								<input type="submit"
									   className="fadeIn fourth" value="Log In"
									   onClick = {this.login}/>
							</form>

							<span style = {{color:"red"}}>
								{this.state.err}
								<br/>
							<br/></span>

							<div id="formFooter">
								<Link to = "/register">Register Now</Link>
							</div>

						</div>
					</div>
				)
			}
			else{
				return	<Redirect to = "/" />
			}
	}
}
