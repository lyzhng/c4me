import React from 'react';
import Axios from 'axios';

export default class HomeScreen extends React.Component{
    logout = (event)=>{
        event.preventDefault();
        document.cookie = 'token=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        this.props.history.push('/login');
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