import React from 'react';
import Axios from 'axios';
import {Redirect} from 'react-router-dom';
import SearchResults from './SearchResults';

export default class SearchColleges extends React.Component{
    state = {
			name: "",
			colleges:[]
    }

		handleChange = (e) => {
			const { target } = e;
			this.setState(state => ({
				[target.name]: target.value,
			}));
		}

    search = (event) => {
			event.preventDefault();
			Axios.post("/searchforcolleges", {query: this.state.name}).then((resp)=>{
				console.log(resp.data.colleges);
				this.setState({colleges: []});
				this.setState({colleges: resp.data.colleges});
			})
    }

    componentDidMount(){
			this.setState({name: "", colleges:[]});
    }

    render(){
			if(this.props.userid)
        return(
            <div>
							<h1>Search for Colleges!</h1>
							<br/>
							<label htmlFor="name">Filter by Name:</label>
							<input type="text" name = "name" onChange ={this.handleChange} />
							<button onClick= {this.search}>Search</button>
							{this.state.colleges.map((college) => {return <SearchResults college = {college}/>})}
            </div>
				)
				return <Redirect to = "/login" />;
		}
}