import React from 'react';
import Axios from 'axios';

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
				console.log(resp.data);
				this.setState({colleges: resp.data.colleges});
			})
    }

    componentDidMount(){
			this.setState({name: "", colleges:[]});
    }

    render(){
        return(
            <div>
							<h1>Search for Colleges!</h1>
							<br/>
							<label htmlFor="name">Filter by Name:</label>
							<input type="text" name = "name" onChange ={this.handleChange} />
							<button onClick= {this.search}>Search</button>
            </div>
        )
    }
}