import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Register from './components/auth/Register.jsx';
import Login from './components/auth/Login.jsx';
import HomeScreen from './components/home/HomeScreen.jsx';
import Auth from './components/auth/Auth.jsx';
import SearchColleges from './components/college/SearchColleges.jsx';
import Navbar from './components/navbar/CNavbar';
import Admin from './components/admin/Admin.jsx';
import Profile from './components/profile/Profile.jsx';
import College from './components/college/College';

export default class App extends React.Component {

	logout = (event)=>{
    event.preventDefault();
    document.cookie = 'token=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/;';
    this.setState({});
	}
  
  render(){
    const NavAuth = Auth(Navbar);
    return (
      <BrowserRouter>
       <div className="App">
       <NavAuth logout = {this.logout.bind(this)} />
          <Switch>
            <Route exact path = "/" component = {HomeScreen} />
            <Route exact path = "/register" component = {Auth(Register)} />
            <Route exact path = "/login" component = {Auth(Login)} />
            <Route path = "/profile/:userid" component={Auth(Profile)} />
            <Route path = "/colleges" component = {Auth(SearchColleges)} />
            { <Route path  = "/college/:name" component = {Auth(College)} /> }
            {/* <Route path = "/highschools" component = {Auth(Highschools)} /> */}
            <Route exact path = "/admin" component = {Auth(Admin)} />
            <Route path = "/:any" component = {HomeScreen} />
          </Switch>
        </div>
      </BrowserRouter>
    );
  }
  
}