import React from 'react';
import Axios from 'axios'
export default class Admin extends React.Component{
	state = {
		status: ""
	}

	scrapeCollegeRankings = (event) => {
		event.preventDefault();
		Axios.get("/scrapecollegerankings").then((resp) => {
			this.setState({status:"Successfully scraped college rankings."});
		}).catch(err =>{
			this.setState({status:"Failed to scrape college rankings."});
		});
	};

	importCollegeScorecard = (event) => {
		event.preventDefault();
		Axios.get("/importcollegescorecard").then((resp) => {
			this.setState({status:"Successfully imported college scorecard."});
		}).catch(err =>{
			this.setState({status:"Failed to import college scorecard."});
		});
	}

	importStudentProfiles = (event) => {
		event.preventDefault();
		Axios.get("/importstudentdatasets").then((resp) => {
			this.setState({status:"Successfully imported student profiles."});
		}).catch(err =>{
			this.setState({status:"Failed to import student profiles."});
		});
	}

	deleteAllStudents =  (event) => {
		event.preventDefault();
		Axios.get("/deletestudents").then((resp) => {
			this.setState({status:"Successfully removed all students and applications"});
		}).catch(err =>{
			this.setState({status:"Failed to delete students"});
		});
	}

	importCollegeData = (event) => {
		event.preventDefault();
		Axios.get("/scrapecollegedata").then((resp) => {
			this.setState({status:"Successfully scraped collegedata."});
		}).catch(err =>{
			this.setState({status:"Failed to scrape collegedata."});
		});
	}

	componentDidMount(){
		this.setState({status:""});
	}

	render(){
			return(
				<div>
					<button onClick = {this.scrapeCollegeRankings}>Scrape College Rankings</button>
					<br/>
					<button onClick = {this.importCollegeScorecard}>Import College Scorecard data file</button>
					<br/>
					<button onClick = {this.importCollegeData}>Import CollegeData</button>
					<br/>
					<button onClick = {this.importStudentProfiles}>Import Student Data Profiles</button>
					<br/>
					<button onClick = {this.deleteAllStudents}>Delete All Student Profiles</button>
					<br/>
					<button>Review Questionable Acceptance Decisions</button>
					<br/>
					<h3>Status:</h3><div>{this.state.status}
					</div>
				</div>		
			);
	}
}