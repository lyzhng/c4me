import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Register from './components/auth/Register.jsx';
import Login from './components/auth/Login.jsx';
import HomeScreen from './components/home/HomeScreen.jsx';
import Auth from './components/auth/Auth.jsx';
import LoggedIn from './components/home/LoggedIn.jsx';
import Admin from './components/admin/Admin.jsx';

export default class App extends React.Component {
  render(){
    return (
      <div className="App">
       <BrowserRouter>
              <Switch>
                <Route exact path = "/" component = {HomeScreen} />
                <Route exact path = "/register" component = {Register} />
                <Route exact path = "/Login" component = {Login} />
                {/* <Route path = "/profile/:userid" component={Auth(Profile)} /> */}
                {/* <Route path = "/colleges" component = {Auth(SearchColleges)} /> */}
                {/* <Route path  = "/college/:name" component = {Auth(College)} /> */}
                {/* <Route path = "/highschools" component = {Auth(Highschools)} /> */}
                <Route exact path = "/admin" component = {Auth(Admin)} />
                <Route path = "/:any" component = {HomeScreen} />
                
              </Switch>
          </BrowserRouter>
      </div>
    );
  }
  
}