import React from 'react';
import Axios from 'axios';
import {Redirect} from 'react-router-dom';
import SearchResults from './SearchResults';

const regionToStates  = 
{
	northeast: ["ME", "NH", "VT", "MA", "CT", "RI", "NJ", "NY", "PA"],
	south: ["DE", "MD", "VA", "WV", "NC", "SC", "GA", "FL", "KY", "TN", "AL", "MS", "AR", "LA", "OK", "TX"],
	midwest: ["ND", "SD", "NE", "KS", "MN", "IA", "MO", "WI", "IL", "IN", "MI", "OH"],
	west: ["MT", "WY", "CO", "NM", "ID", "UT", "AZ", "WA", "OR", "NV", "CA"]
}

export default class SearchColleges extends React.Component{
    state = {
			name: "",
			colleges: [], 
			//filters
			strict: false,
			location: "", //4 regions
			costOfAttendance: -1, //upperbound
			major1: "",
			major2: "",
			admissionRateUpper: -1, //in %
			admissionRateLower: -1, //in %
			rankingUpper: -1,
			rankingLower: -1,
			sizeUpper: -1,
			sizeLower: -1,
			satMathUpper: -1,
			satMathLower: -1,
			satEngUpper: -1,
			satEngLower: -1,
			actUpper: -1,
			actLower: -1
    }

	handleChange = (e) => {
		this.setState({
			[e.target.name] : e.target.value,
		});
	}

	checkRange(value, lowerBound, upperBound, lowerLimit, upperLimit)
	{
		if (lowerLimit && lowerBound < lowerLimit) //invalid lowerbound, return true (filters wont do anything)
		{
			return true;
		}
		if (upperLimit && upperBound > upperLimit) //invalid upperbound, return true (filters wont do anything)
		{
			return true;
		}
		if (lowerBound <= upperBound)
		{
			return value >= lowerBound && value <= upperBound;
		}
		else
		{
			return true; //lowerbound is greater than upperbound, return true (filters wont do anything)
		}
	}

	checkLocation(college) //returns true if college passes filters
	{
		if (college.location && college.location.state)
		{
			if (this.location === "")
			{
				return true;
			}
			else if (!regionToStates[this.location]) //if somehow user enters wrong location (through post or something)
			{
				return false;
			}
			else
			{
				return regionToStates[this.location].includes(college.location.state);
			}
		}
		else
		{
			return this.strict ? false : true;
		}
	}

	checkCost(college) //must get user state, to determine if cost is instate or out of state
	{
		return true;
	}

	checkMajor(college) //annoying af
	{
		return true;
	}

	checkAdmissionRate(college)
	{
		if (college.admission_rate !== -1)
		{
			return this.checkRange(college.admission_rate, this.admissionRateLower, this.admissionRateUpper, 0, 100);
		}
		else
		{
			return this.strict ? false : true;
		}
	}

	checkRanking(college)
	{
		if (college.ranking !== -1)
		{
			return this.checkRange(college.ranking, this.rankingLower, this.rankingUpper, 0);
		}
		else
		{
			return this.strict ? false : true;
		}
	}

    search = (event) => {
			event.preventDefault();
			Axios.post("/searchforcolleges", {query: this.state.name}).then((resp)=>{
				this.setState ({colleges: resp.data.colleges});
			});
    }

    componentDidMount(){
			this.setState({
			name: "",
			colleges: [], 
			//filters
			strict: false,
			location: "", //4 regions
			costOfAttendance: -1, //upperbound
			major1: "",
			major2: "",
			admissionRateUpper: -1, //in %
			admissionRateLower: -1, //in %
			rankingUpper: -1,
			rankingLower: -1,
			sizeUpper: -1,
			sizeLower: -1,
			satMathUpper: -1,
			satMathLower: -1,
			satEngUpper: -1,
			satEngLower: -1,
			actUpper: -1,
			actLower: -1
    });
    }

    render(){
			if(this.props.userid)
			{
				console.log(this.state.colleges);
        return(
            <div className = "container">
            	<h1 className = "text-center">Search for Colleges!</h1>
       			<div className = "row">
       				<div className = "col-4">
       					<div>
       						strict:
       						<input type = "checkbox" name = "strict" onChange ={this.handleChange} />
       					</div>
       					<div>
       						admissionRateLower
       						<input type = "number" name = "admissionRateLower" onChange ={this.handleChange}/>
       					</div>
       					<div>
       						admissionRateUpper
       						<input type = "number" name = "admissionRateUpper" onChange ={this.handleChange}/>
       					</div>
       					<div>
       						sizeLower
       						<input type = "number" name = "sizeLower" onChange ={this.handleChange}/>
       					</div>
       					<div>
       						sizeUpper
       						<input type = "number" name = "sizeUpper" onChange ={this.handleChange}/>
       					</div>
       					<div>
       						satMathLower
       						<input type = "number" name = "satMathLower" onChange ={this.handleChange}/>
       					</div>
       					<div>
       						satMathUpper
       						<input type = "number" name = "satMathUpper" onChange ={this.handleChange}/>
       					</div>
       					<div>
       						satEngLower
       						<input type = "number" name = "satEngLower" onChange ={this.handleChange}/>
       					</div>
       					<div>
       						satEngUpper
       						<input type = "number" name = "satEngUpper" onChange ={this.handleChange}/>
       					</div>
       					<div>
       						satEngLower
       						<input type = "number" name = "satEngLower" onChange ={this.handleChange}/>
       					</div>
       					<div>
       						satEngUpper
       						<input type = "number" name = "satEngUpper" onChange ={this.handleChange}/>
       					</div>
       					<div>
       						major1
       						<input type = "text" name = "major1" onChange ={this.handleChange}/>
       					</div>
       					<div>
       						major2
       						<input type = "text" name = "major2" onChange ={this.handleChange}/>
       					</div>
       					<div>
       						costOfAttendance
       						<input type = "number" name = "costOfAttendance" onChange ={this.handleChange}/>
       					</div>
       					<div>
       						location
       						<select name = "location">
       						  <option value="">No preference</option>
							  <option value="northeast">Northeast</option>
							  <option value="midwest">Midwest</option>
							  <option value="south">South</option>
							  <option value="west">West</option>
							</select>
       					</div>
       				</div>
       				<div className = "col-8">
       					<label htmlFor="name">Filter by Name:</label>
						<input type="text" name = "name" onChange ={this.handleChange} />
						<button onClick= {this.search}>Search</button>
						{this.state.colleges.map((college) => {return <SearchResults key = {college._id} college = {college} display = {true}/>})}
       				</div>
       			</div>
            </div>
				)
        	}
				return <Redirect to = "/login" />;
		}
}