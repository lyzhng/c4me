import React from 'react';
import Axios from 'axios';

export default class HomeScreen extends React.Component{
    logout = (event)=>{
        event.preventDefault();
        cookies.remove('token');
    }
    render(){
        return(
            <div>
                Logged IN!
                <button onClick = {this.logout}>Log out</button>
            </div>
        )
    }
}