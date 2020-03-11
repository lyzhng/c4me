import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Register from './components/auth/Register.jsx';
import Login from './components/auth/Login.jsx';
import HomeScreen from './components/home/HomeScreen.jsx';
import Auth from './components/auth/Auth.jsx';
import LoggedIn from './components/home/LoggedIn.jsx'
export default class App extends React.Component {
  render(){
    return (
      <div className="App">
       <BrowserRouter>
              <Switch>
                <Route exact path="/" component= {HomeScreen} />
                <Route exact path="/register" component={Register} />
                <Route exact path="/Login" component={Login} />
                <Route exact path="/blah" component= {Auth(LoggedIn)} />
                {/* <Route path="/profile/:username" component={Profile} /> */}
                <Route path="/:any" component={HomeScreen} />
                
              </Switch>
          </BrowserRouter>
      </div>
    );
  }
  
}