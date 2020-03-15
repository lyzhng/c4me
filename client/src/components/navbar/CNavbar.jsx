import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';

export default class CNavbar extends React.Component{
	state = {
		visibility: "visible",
		userid: ""
	}

	logout = (event)=>{
        event.preventDefault();
        document.cookie = 'token=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        this.props.history.push('/login');
	}
	
	componentDidMount(){
		if(this.props.userid)
			this.setState({visibility: "visible", userid:this.props.userid});
		else
			this.setState({visibility: "hidden", userid:""});
	}

	render(){
		return(
			<Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
			<Navbar.Brand href="#home">c4Me</Navbar.Brand>
			<Navbar.Toggle aria-controls="responsive-navbar-nav" />
			<Navbar.Collapse id="responsive-navbar-nav">
			<Nav className="mr-auto" style ={{visibility: this.state.visibility}}>
				<Nav.Link href="/colleges">Search for colleges</Nav.Link>
				<Nav.Link href="/highschools">High Schools</Nav.Link>
			</Nav>
			<Nav>
			{this.state.userid ? <React.Fragment><Nav.Link href={"/profile"+this.state.userid}>My Profile</Nav.Link><Button onClick = {this.logout}>Logout</Button></React.Fragment> : <React.Fragment><Nav.Link href="/register">Register</Nav.Link><Nav.Link href="/login">Login</Nav.Link></React.Fragment> 
			}
			</Nav>
			</Navbar.Collapse>
			</Navbar>
		)
	}
}