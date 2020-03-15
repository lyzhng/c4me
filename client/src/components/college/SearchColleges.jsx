import React from 'react';
import Axios from 'axios';

export default class SearchColleges extends React.Component{
    state = {

    }

    search = (event) => {
			event.preventDefault();
    }

    componentDidMount(){

    }

    render(){
        return(
            <div>
							<h1>Search for Colleges!</h1>
							<br/>
							<input type="text" />
							<button>Search</button>
            </div>
        )
    }
}