import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
import  { Link } from 'react-router-dom';
export default class CNavbar extends React.Component{

	state = {
		visibility: "visible",
		userid: ""
	}

	componentDidMount(){
		if(this.props.userid && this.props.userid !== "admin"){
			this.setState({visibility: "visible", userid:this.props.userid});
		}
		else if(this.props.userid && this.props.userid === "admin"){
			this.setState({visibility: "hidden", userid:"admin"})
		}
		else{
			this.setState({visibility: "hidden", userid:""});
		}
	}

	render(){
		return(
			<Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
			<Navbar.Brand href="/">c4Me</Navbar.Brand>
			<Navbar.Toggle aria-controls="responsive-navbar-nav" />
			<Navbar.Collapse id="responsive-navbar-nav">
			<Nav className="mr-auto" style ={{visibility: this.state.visibility}}>
				<Nav.Link href="/colleges">Search for colleges</Nav.Link>
				<Nav.Link href="/highschools">High Schools</Nav.Link>
			</Nav>
			<Nav>
			{this.state.userid ? 
			this.state.userid !== "admin" ? <React.Fragment><Nav.Link href={"/profile"}>{this.state.userid}</Nav.Link><Button variant = "link" onClick = {this.props.logout}>Logout</Button></React.Fragment> : 
			<Button onClick = {this.props.logout}>Logout</Button>
			: <React.Fragment><Nav.Link href="/register"><Link to = "/register">Register</Link></Nav.Link><Nav.Link ><Link to = "/login">Login</Link></Nav.Link></React.Fragment> 
			}
			</Nav>
			</Navbar.Collapse>
			</Navbar>
		)
	}
}