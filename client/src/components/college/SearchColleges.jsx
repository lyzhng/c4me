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

function isInt(n) {  //copied from https://stackoverflow.com/questions/5630123/javascript-string-integer-comparisons
	  return /^[+-]?\d+$/.test(n);
	};

export default class SearchColleges extends React.Component{
    state = {
			name: "",
			colleges: [], 
			//filters
			strict: false,
			location: "", //4 regions
			costOfAttendance: Number.MAX_SAFE_INTEGER, //upperbound
			major1: "",
			major2: "",
			admissionRateUpper: 100, //in %
			admissionRateLower: 0, //in %
			rankingUpper: Number.MAX_SAFE_INTEGER,
			rankingLower: 1,
			sizeUpper: Number.MAX_SAFE_INTEGER,
			sizeLower: 0,
			satMathUpper: 800,
			satMathLower: 200,
			satEngUpper: 800,
			satEngLower: 200,
			actUpper: 36,
			actLower: 1
    }

    setStateDefault = () => //resets all numeric fields to default, if fields are empty.
    {
    	this.setState({
    		costOfAttendance : this.state.costOfAttendance === "" ? Number.MAX_SAFE_INTEGER : this.state.costOfAttendance,
    		admissionRateUpper : this.state.admissionRateUpper === "" ? 100 : this.state.admissionRateUpper,
    		admissionRateLower : this.state.admissionRateLower === "" ? 0 : this.state.admissionRateLower,
    		rankingUpper : this.state.rankingUpper === "" ? Number.MAX_SAFE_INTEGER : this.state.rankingUpper,
    		rankingLower : this.state.rankingLower === "" ? 0 : this.state.rankingLower,
    		sizeUpper : this.state.sizeUpper === "" ? Number.MAX_SAFE_INTEGER : this.state.sizeUpper,
    		sizeLower : this.state.sizeLower === "" ? 0 : this.state.sizeLower,
    		satMathUpper : this.state.satMathUpper === "" ? 800 : this.state.satMathUpper,
    		satMathLower : this.state.satMathLower === "" ? 5000 : this.state.satMathLower,
    		satEngUpper : this.state.satEngUpper === "" ? 800 : this.state.satEngUpper,
    		satEngLower : this.state.satEngLower === "" ? 200 : this.state.satEngLower,
    		actUpper : this.state.actUpper === "" ? 36 : this.state.actUpper,
    		actLower : this.state.actLower === "" ? 1 : this.state.actLower,
    	});
    }

	handleChange = (e) => {
		this.setState({
			[e.target.name] : isInt(e.target.value) ? parseInt(e.target.value) : e.target.value,
		}, this.setStateDefault);
		console.log(this.state);
	}

	checkRange = (value, lowerBound, upperBound, lowerLimit, upperLimit) =>
	{
		if ((lowerLimit != undefined) && (lowerBound < lowerLimit)) //invalid lowerbound, return true (filters wont do anything)
		{
			return true;
		}
		if ((upperLimit != undefined) && (upperBound > upperLimit)) //invalid upperbound, return true (filters wont do anything)
		{
			return true;
		}
		if (lowerBound <= upperBound)
		{
			return (value >= lowerBound) && (value <= upperBound);
		}
		else
		{
			return true; //lowerbound is greater than upperbound, return true as this is invalid input (filters wont do anything)
		}
	}

	checkLocation = (college) => //returns true if college passes filters
	{
		if (college.location && college.location.state)
		{
			if (this.state.location === "")
			{
				return true;
			}
			else if (!regionToStates[this.state.location]) //if somehow user enters wrong location (through post or something)
			{
				return false;
			}
			else
			{
				return regionToStates[this.state.location].includes(college.location.state);
			}
		}
		else
		{
			return this.strict ? false : true;
		}
	}

	checkCost = (college) =>//must get user state, to determine if cost is instate or out of state
	{
		if (college.cost.attendance.in_state != -1)
		{
			return this.checkRange(college.cost.attendance.in_state, 0, this.state.costOfAttendance, 0);
		}
		else
		{
			return this.state.strict ? false : true;
		}
	}

	checkMajor = (college) => //annoying af
	{
		if (college.majors.length != 0)
		{
			let match = false;
			for (let i = 0; i < college.majors.length; i ++)
			{
				if ((college.majors[i].toLowerCase().indexOf(this.state.major1.toLowerCase()) !== -1) && (college.majors[i].toLowerCase().indexOf(this.state.major2.toLowerCase()) !== -1))
				{
					match = true;
					break;
				}
			}
			return match;
		}
		else
		{
			return this.state.strict ? false : true;
		}
	}

	checkSize = (college) =>
	{
		if (college.size != -1)
		{
			return this.checkRange(college.size, this.state.sizeLower, this.state.sizeUpper, 0);
		}
		else
		{
			return this.state.strict ? false : true;
		}
	}

	checkSatMath = (college) =>
	{
		if (college.sat.math_avg != -1)
		{
			return this.checkRange(college.sat.math_avg, this.state.satMathLower, this.state.satMathUpper, 200, 800);
		}
		else
		{
			return this.state.strict ? false : true;
		}
	}

	checkSatEng = (college) =>
	{
		if (college.sat.EBRW_avg != -1)
		{
			return this.checkRange(college.sat.EBRW_avg, this.state.satEngLower, this.state.satEngUpper, 200, 800);
		}
		else
		{
			return this.state.strict ? false : true;
		}
	}

	checkAct = (college) =>
	{
		if (college.act.avg != -1)
		{
			return this.checkRange(college.act.avg, this.state.actLower, this.state.actUpper, 1, 36);
		}
		else
		{
			return this.state.strict ? false : true;
		}
	}

	checkAdmissionRate = (college) =>
	{
		if (college.admission_rate !== -1)
		{
			return this.checkRange(college.admission_rate, this.state.admissionRateLower, this.state.admissionRateUpper, 0, 100);
		}
		else
		{
			return this.state.strict ? false : true;
		}
	}

	checkRanking = (college) =>
	{
		if (college.ranking !== -1)
		{
			return this.checkRange(college.ranking, this.state.rankingLower, this.state.rankingUpper, 1);
		}
		else
		{
			return this.state.strict ? false : true;
		}
	}

	filter = (event) => {
		event.preventDefault();
		 //make a copy of colleges cause react
		let colleges = this.state.colleges.map((college) => {return Object.assign({}, college)});
		for (let i = 0; i < colleges.length; i ++)
		{
			let college = colleges[i];
			//colleges[i].hidden = !this.checkAdmissionRate(college);
			college.hidden = !(this.checkLocation(college) && this.checkCost(college) && this.checkMajor(college)
			&& this.checkSize(college) && this.checkSatMath(college) && this.checkSatEng(college) && this.checkAct(college)
			&& this.checkAdmissionRate(college) && this.checkRanking(college));

			//console.log("location: " + this.checkLocation(college)); good
			//console.log("major: " + this.checkMajor(college)); good?
			// console.log("size: " + this.checkSize(college)); //good
			// console.log("satmath: " + !this.checkSatMath(college)); //good
			//console.log("sateng: " + this.checkSatEng(college)); //good
			// console.log("act: " + this.checkAct(college)); //good
			// console.log("admission: " + this.checkAdmissionRate(college)); //good
			// console.log("ranking: " + this.checkRanking(college)); //good
			// console.log("ranking: " + this.checkCost(college)); //good
		}
		//set the hidden field
		this.setState({colleges : colleges});

	}

    search = (event) => {
			event.preventDefault();
			Axios.post("/searchforcolleges", {query: this.state.name}).then((resp)=>{
				this.setState ({colleges: resp.data.colleges});
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
       						rankingLower
       						<input type = "number" name = "rankingLower" onChange ={this.handleChange}/>
       					</div>
       					<div>
       						rankingUpper
       						<input type = "number" name = "rankingUpper" onChange ={this.handleChange}/>
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
       						actLower
       						<input type = "number" name = "actLower" onChange ={this.handleChange}/>
       					</div>
       					<div>
       						actUpper
       						<input type = "number" name = "actUpper" onChange ={this.handleChange}/>
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
       						<select name = "location" onChange ={this.handleChange}>
       						  <option value="">No preference</option>
							  <option value="northeast">Northeast</option>
							  <option value="midwest">Midwest</option>
							  <option value="south">South</option>
							  <option value="west">West</option>
							</select>
       					</div>
       					<div>
							<button name = "filter" onClick ={this.filter}>Apply Filters</button>
       					</div>
       				</div>
       				<div className = "col-8">
       					<label htmlFor="name">Filter by Name:</label>
						<input type="text" name = "name" onChange ={this.handleChange} />
						<button onClick= {this.search}>Search</button>
						{
							this.state.colleges.map((college) => {return <SearchResults key = {college._id} college = {college} display = {college.hidden}/>})
						}
       				</div>
       			</div>
            </div>
				)
        	}
				return <Redirect to = "/login" />;
		}
}

