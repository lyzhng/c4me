import React from 'react';
import Axios from 'axios';
import {Redirect} from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default class Admin extends React.Component{
	state = {
		status: '',
		questionableApps: [],
		selectedApps: [],
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

	retrieveQuestionableApps = async () => {
		const resp = await Axios.post('/retrievequestionableapps');
		console.log('Retrieving Questionable Apps');
		console.log(resp.data);
		this.setState({ questionableApps: resp.data.questionableApps });
	}

	handleQuestionableApps = (_id) => {
		console.log('_id (handlequestionableapps):', _id);
		console.log('this.state.selectedApps (handlequestionableapps)', this.state.selectedApps);
		if (this.state.selectedApps.includes(_id)) {
			console.log('Included already!');
			const updated = this.state.selectedApps.filter((appId) => appId !== _id);
			console.log('Updated:', updated);
			this.setState({ selectedApps: updated }, () => console.log('Updated selectedApps:', this.state.selectedApps));
		} else {
			this.state.selectedApps.push(_id);
			this.setState({ selectedApps: this.state.selectedApps }, () => console.log('Updated selectedApps:', this.state.selectedApps));
		}
	}

	markNotQuestionable = async () => {
		const resp = await Axios.post('/marknotquestionable', {
			selectedApps: this.state.selectedApps,
			questionableApps: this.state.questionableApps
		});
		this.clearSelectedApps();
		console.log('resp.data.questionableApps', resp.data.questionableApps);
		this.setState({ questionableApps: resp.data.questionableApps });
		console.log('questionable apps after setting', this.state.questionableApps);
	}

	clearSelectedApps = () => {
		this.setState({ selectedApps: [] });
	}

	render(){
		if (this.props.userid && this.props.userid === "admin") {
			return (
				<div className={`container my-4`}>
					<h3>Status: {this.state.status}</h3>
					<Button onClick={this.scrapeCollegeRankings} className={`my-1`}>Scrape Times Higher Education Rankings</Button>
					<br />
					<Button onClick={this.importCollegeScorecard} className={`my-1`}>Import College Scorecard data file</Button>
					<br />
					<Button onClick={this.importCollegeData} className={`my-1`}>Import CollegeData</Button>
					<br />
					<Button onClick={this.importStudentProfiles} className={`my-1`}>Import Student Data Profiles</Button>
					<br />
					<Button onClick={this.deleteAllStudents} className={`my-1`}>Delete All Student Profiles</Button>
					<br />
					<Button onClick={this.retrieveQuestionableApps} className={`my-1`}>Review Questionable Acceptance Decisions</Button>
					<Form
						style={{ display: this.state.questionableApps.length === 0 ? 'none' : 'block' }}
						className={`my-4`}>
						<Form.Label className={`h4`}>Questionable Applications</Form.Label>
						{
							this.state.questionableApps.map((app) => {
								return (
									<Form.Group key={app._id}>
										<Form.Row>
										<Form.Check
											inline
											type="checkbox"
											name={app._id}
											onChange={(e) => this.handleQuestionableApps(e.target.name)}
											/>
											<Form.Label className={`mt-2`}>
												{`${app.status.charAt(0).toUpperCase() + app.status.slice(1)} to ${app.college} by `}
												<Link to={`/profile/${app.userid}`}>{app.userid}</Link>
											</Form.Label>
										</Form.Row>
									</Form.Group>
								)
							})
						}
						<Button onClick={this.markNotQuestionable}>Mark Application as Not Questionable</Button>
					</Form>
				</div>
			);	
		} else {
			return (
				<div>
					<h1>Log in as Admin to access this page.</h1>
				</div>
			)	
		}
	}
}