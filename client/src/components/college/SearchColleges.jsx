import React from 'react';
import Axios from 'axios';
import {Redirect} from 'react-router-dom';
import SearchResults from './SearchResults';
import { Form, Col, Button, Accordion, Card } from 'react-bootstrap';

const regionToStates  = 
{
	northeast: ["ME", "NH", "VT", "MA", "CT", "RI", "NJ", "NY", "PA"],
	south: ["DE", "MD", "VA", "WV", "NC", "SC", "GA", "FL", "KY", "TN", "AL", "MS", "AR", "LA", "OK", "TX"],
	midwest: ["ND", "SD", "NE", "KS", "MN", "IA", "MO", "WI", "IL", "IN", "MI", "OH"],
	west: ["MT", "WY", "CO", "NM", "ID", "UT", "AZ", "WA", "OR", "NV", "CA"]
}

const allStates = [
	"ME", "NH", "VT", "MA", "CT", "RI", "NJ", "NY", "PA",
	"DE", "MD", "VA", "WV", "NC", "SC", "GA", "FL", "KY", "TN", "AL", "MS", "AR", "LA", "OK", "TX",
	"ND", "SD", "NE", "KS", "MN", "IA", "MO", "WI", "IL", "IN", "MI", "OH",
	"MT", "WY", "CO", "NM", "ID", "UT", "AZ", "WA", "OR", "NV", "CA",
	"AK", "HI"
]

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
			ascending : false,
			location: "", //refers to 4 regions
			locations: [], //refers to user entered states (abbrev. form)
			newlocation : "",
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
    		rankingLower : this.state.rankingLower === "" ? 1 : this.state.rankingLower,
    		sizeUpper : this.state.sizeUpper === "" ? Number.MAX_SAFE_INTEGER : this.state.sizeUpper,
    		sizeLower : this.state.sizeLower === "" ? 0 : this.state.sizeLower,
    		satMathUpper : this.state.satMathUpper === "" ? 800 : this.state.satMathUpper,
    		satMathLower : this.state.satMathLower === "" ? 200 : this.state.satMathLower,
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
		//console.log(this.state);
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
			return (this.state.location === "" ? true : regionToStates[this.state.location].includes(college.location.state.toUpperCase()))
			&& ((this.state.locations.length === 0) ? true : (this.state.locations.includes(college.location.state.toUpperCase())));
		}
		else
		{
			return this.strict ? false : true;
		}
	}

	checkCost = (college) =>//must get user state, to determine if cost is instate or out of state
	{
		if ((college.type === "Public") && (this.state.student != null))
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
			if (college.cost.attendance.in_state !== -1) //instate same as outofstate or no student exists for some reason
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

	addLocation = () =>
	{
		if ((this.state.locations.length < 50) && (allStates.includes(this.state.newlocation.toUpperCase())) )
		{
			if (!this.state.locations.includes(this.state.newlocation))
			{
				let newLocations = this.state.locations.map((location) => {return location + "";});
				newLocations.push(this.state.newlocation.toUpperCase());
				this.setState({locations: newLocations, newlocation : ""});
			}
		}

	}

	removeLocation = (index) =>
	{
		let newLocations = this.state.locations.map((location) => {return location + "";});
		this.setState({locations : newLocations.filter((location, i) => {return i != index})});
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
		//console.log(this.state.ascending);
		if (this.state.sortCriteria === "name")
		{
			quicksort(colleges, 0, colleges.length - 1, (college1, college2) => {
				return this.state.ascending ? college1.name.toLowerCase() < college2.name.toLowerCase() : college1.name.toLowerCase() > college2.name.toLowerCase();
			});
		}
		else if (this.state.sortCriteria === "admissionRate")
		{
			quicksort(colleges, 0, colleges.length - 1, (college1, college2) => {
				return this.state.ascending ? college1.admission_rate < college2.admission_rate : college1.admission_rate > college2.admission_rate;
			});
		}
		else if (this.state.sortCriteria === "costOfAttendance")
		{
			quicksort(colleges, 0, colleges.length - 1, (college1, college2) => {
				if (this.state.student != null)
				{
					let cost1 = this.state.student.location === college1.location.state ? college1.cost.attendance.in_state : college1.cost.attendance.out_state;
					let cost2 = this.state.student.location === college2.location.state ? college2.cost.attendance.in_state : college2.cost.attendance.out_state;
					return this.state.ascending ? cost1 < cost2 : cost1 > cost2;

				}
				else //no student, default to instate
				{
					return this.state.ascending ? college1.cost.attendance.in_state < college2.cost.attendance.in_state : college1.cost.attendance.in_state > college2.cost.attendance.in_state;
				}
			});
		}
		else if (this.state.sortCriteria === "ranking")
		{
			quicksort(colleges, 0, colleges.length - 1, (college1, college2) => {
				return this.state.ascending ? college1.ranking < college2.ranking : college1.ranking > college2.ranking;
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
				//console.log(this.state.student);
				//console.log(this.state.colleges);
				//console.log(typeof(this.handleChange));
        return(
            <div className = "container">
            	<h1 className = "text-center my-3">Search for Colleges</h1>
       			<div className = "row">
					<div className="col-4">
						<Form>
							<Form.Group>
								<Form.Check
									name="strict"
									onClick={() => { this.state.strict = !this.state.strict }}
									label="Strict"
								/>
							</Form.Group>
							{
								[
									{	'name': 'rankingLower' ,
										'label': 'Minimum Ranking',
										'type': 'number'
									},
									{
										'name': 'rankingUpper',
										'label': 'Maximum Ranking',
										'type': 'number'
									},
									{
										'name': 'admissionRateLower',
										'label': 'Minimum Admission Rate',
										'type': 'number'
									},
									{
										'name': 'admissionRateUpper',
										'label': 'Maximum Admission Rate',
										'type': 'number'
									},
									{
										'name': 'sizeLower',
										'label': 'Minimum Size',
										'type': 'number'
									},
									{
										'name': 'sizeUpper',
										'label': 'Maximum Size',
										'type': 'number'
									},
									{
										'name': 'major1',
										'label': 'Major 1',
										'type': 'text'
									},
									{
										'name': 'major2',
										'label': 'Major 2',
										'type': 'text'
									},
									{
										'name': 'costOfAttendance',
										'label': 'Cost of Attendance',
										'type': 'number'
									},
									{
										'name': 'satMathLower',
										'label': 'Minimum SAT Math',
										'type': 'number'
									},
									{
										'name': 'satMathUpper',
										'label': 'Maximum SAT Math',
										'type': 'number'
									},
									{
										'name': 'satEngLower',
										'label': 'Minimum SAT English',
										'type': 'number'
									},
									{
										'name': 'satEngUpper',
										'label': 'Maximum SAT English',
										'type': 'number'
									},
									{
										'name': 'actLower',
										'label': 'Minimum ACT',
										'type': 'number'
									},
									{
										'name': 'actUpper',
										'label': 'Maximum ACT',
										'type': 'number'
									},
								].map((filter) => {
									return (
										<Form.Group key={filter.name}>
											<Form.Row>
												<Form.Label column>{filter.label}</Form.Label>
												<Col>
													<Form.Control
														type={filter.type}
														name={filter.name}
														label={filter.label}
														onChange={this.handleChange}
													/>
												</Col>
											</Form.Row>
										</Form.Group>
										)
								})
							}
							<Form.Group>
								<Form.Row>
									<Form.Label column>Sort Results</Form.Label>
									<Col>
										<Form.Control as="select" onChange={this.handleChange} name="sortCriteria">
											<option value="">No preference</option>
											<option value="name">by name</option>
											<option value="admissionRate">by admission rate</option>
											<option value="costOfAttendance">by cost</option>
											<option value="ranking">by ranking</option>
										</Form.Control>
									</Col>
								</Form.Row>
								<Form.Check
									label="Ascending"
									type="checkbox"
									name="ascending"
									onClick={() => { this.state.ascending = !this.state.ascending }}
								/>
							</Form.Group>
							<Form.Group>
								<Form.Row>
									<Form.Label column>Location</Form.Label>
									<Col>
										<Form.Control as="select" onChange={this.handleChange} name="location">
											<option value="">No preference</option>
											<option value="northeast">Northeast</option>
											<option value="midwest">Midwest</option>
											<option value="south">South</option>
											<option value="west">West</option>
										</Form.Control>
									</Col>
								</Form.Row>
							</Form.Group>
							<Form.Group>
								<Form.Row>
									<Form.Label column>Locations</Form.Label>
									<Form.Control
										type={"text"}
										name={"newlocation"}
										label={"New Location"}
										onChange={this.handleChange}
										value={this.state.newlocation}
									/>
									<Col>
										<Button variant="primary" onClick={this.addLocation}>add Location</Button>
									</Col>

								</Form.Row>
							</Form.Group>
							<Accordion>
				              <Card>
				                <Card.Header>
				                  <Accordion.Toggle as={Button} variant="link" eventKey="0">
				                    Locations Being Filtered
				                  </Accordion.Toggle>
				                </Card.Header>
				                <Accordion.Collapse eventKey="0">
				                  <Card.Body>
				                   	{
										this.state.locations.map((location, index) => {
											console.log(location);
											return (
												<div key = {location}>
													<h6>{location}</h6>
													<Button variant="primary" onClick={this.removeLocation.bind(this, index)}>remove location</Button>
												</div>
												)
										})
									}
				                  </Card.Body>
				                </Accordion.Collapse>
				              </Card>
				            </Accordion>
							<Button variant="primary" onClick={this.filter}>Apply Filters</Button>
							<Button variant="outline-dark" className="ml-2" onClick={this.sort}>Apply Sort</Button>
						</Form>
       				</div>
					<div className="col-8">
						<Form>
							<Form.Group>
								<Form.Row>
									<Form.Label column lg="2">Filter by Name</Form.Label>
									<Col>
										<Form.Control
											type="text"
											name="name"
											onChange={this.handleChange}
										/>
									</Col>
									<Col>
										<Button onClick={this.search} variant="primary" type="submit">Search</Button>
									</Col>
								</Form.Row>
							</Form.Group>
						</Form>
						{
							this.state.colleges.map((college) => {return <SearchResults key = {college._id} KEY = {college._id} college = {college} display = {college.hidden} />})
						}
       				</div>
       			</div>
            </div>
				)
        	}
				return <Redirect to = "/login" />;
		}
}

