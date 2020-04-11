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

//sort by name, admission rate, cost of attendance, and ranking
function quicksort (arr, start, end, sortby)
{
	if (start < end)
	{
		//pick a index, swap with pivot
		var randomIndex = Math.floor((Math.random() * (end - start - 1)) + start);
		var temp = arr[randomIndex];
		arr[randomIndex] = arr[end];
		arr[end] = temp;

		var partition = arr[end];
		var low = start - 1;
		var pointer = start;

		//put everything higher than partition on the left
		while (pointer < end)
		{
			if (sortby(arr[pointer], partition))
			{
				low ++;
				temp = arr[low];
				arr[low] = arr[pointer];
				arr[pointer] = temp;
			}
			pointer ++;
		}

		//swap partition 
		var temp = arr[low + 1];
		arr[low + 1] = arr[end];
		arr[end] = temp;

		quicksort(arr, start, low, sortby);
		quicksort(arr, low + 2, end, sortby);

	}
};

export default class SearchColleges extends React.Component{

    constructor(props)
    {
    	super(props);
    	this.state = {
    		name: "",
			colleges: [], 
			//filters
			strict: false,
			ascending : true,
			location: "", //4 regions
			sortCriteria: "", //sort by name, admission rate, cost of attendance, and ranking
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
			actLower: 1,

			student: null
    	}
    	if (this.props.userid)
    	{
    		Axios.post("/getuser", {userId: this.props.userid}).then((resp) => {this.setState({student : resp.data.user});});
    	}
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
		if ((lowerLimit !== undefined) && (lowerBound < lowerLimit)) //invalid lowerbound, return true (filters wont do anything)
		{
			return true;
		}
		if ((upperLimit !== undefined) && (upperBound > upperLimit)) //invalid upperbound, return true (filters wont do anything)
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
		if (college.type === "Public")
		{
			let cost = this.state.student.location === college.location.state ? college.cost.attendance.in_state : college.cost.attendance.out_state;
			if (cost !== -1) //cost depends on user location
			{
				return this.checkRange(cost, 0, this.state.costOfAttendance, 0);
			}
			else
			{
				return this.state.strict ? false : true;
			}
		}
		else
		{
			if (college.cost.attendance.in_state !== -1) //instate same as outofstate
			{
				return this.checkRange(college.cost.attendance.in_state, 0, this.state.costOfAttendance, 0);
			}
			else
			{
				return this.state.strict ? false : true;
			}
		}
	}

	checkMajor = (college) => //annoying af
	{
		if (college.majors.length !== 0)
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
		if (college.size !== -1)
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
		if (college.sat.math_avg !== -1)
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
		if (college.sat.EBRW_avg !== -1)
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
		if (college.act.avg !== -1)
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
	//sort by name, admission rate, cost of attendance, and ranking
	sort = (event) => {
		let colleges = this.state.colleges.map((college) => {return Object.assign({}, college)});
		console.log(this.state.ascending);
		if (this.state.sortCriteria === "name")
		{
			quicksort(colleges, 0, colleges.length - 1, (college1, college2) => {
				return this.state.ascending ? college1.name.toLowerCase() > college2.name.toLowerCase() : college1.name.toLowerCase() < college2.name.toLowerCase();
			});
		}
		else if (this.state.sortCriteria === "admissionRate")
		{
			quicksort(colleges, 0, colleges.length - 1, (college1, college2) => {
				return this.state.ascending ? college1.admission_rate > college2.admission_rate : college1.admission_rate < college2.admission_rate;
			});
		}
		else if (this.state.sortCriteria === "costOfAttendance")
		{
			quicksort(colleges, 0, colleges.length - 1, (college1, college2) => {
				return this.state.ascending ? college1.cost.attendance.in_state > college2.cost.attendance.in_state : college1.cost.attendance.in_state < college2.cost.attendance.in_state;
			});
		}
		else if (this.state.sortCriteria === "ranking")
		{
			quicksort(colleges, 0, colleges.length - 1, (college1, college2) => {
				return this.state.ascending ? college1.ranking > college2.ranking : college1.ranking < college2.ranking;
			});
		}
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
				console.log(this.state.student);
				//console.log(this.state.colleges);
				//console.log(typeof(this.handleChange));
        return(
            <div className = "container">
            	<h1 className = "text-center">Search for Colleges!</h1>
       			<div className = "row">
       				<div className = "col-4">
       					<div>
       						strict:
       						<input type = "checkbox" onClick ={() => {this.state.strict = !this.state.strict}} />
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
       						sort by
       						<select name = "sortCriteria" onChange ={this.handleChange}>
       						  <option value="">No option</option>
							  <option value="name">by name</option>
							  <option value="admissionRate">by admission rate</option>
							  <option value="costOfAttendance">by cost</option>
							  <option value="ranking">by ranking</option>
							</select>
       						ascending:
       						<input type = "checkbox" onClick ={() => {this.state.ascending = !this.state.ascending}}/>
       					</div>
       					<div>
							<button  onClick ={this.filter}>Apply Filters</button>
							<button  onClick ={this.sort}>Apply Sort</button>
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

