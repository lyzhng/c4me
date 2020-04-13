import React from 'react';
import Chart from 'chart.js';

export default class Scatterplot extends React.Component{
	scatterplotRef = React.createRef();

	state = {
		testScores: "SAT"
	}

	handleChange = (event) => {
		this.setState({
			testScores: event.target.value
		}, this.renderChart);
		}

	//calculates the X value of each point
	calculateX = (student) => {
		if (this.state.testScores === "SAT"){
			return student.SAT_EBRW + student.SAT_math;
		}
		else if (this.state.testScores === "ACT") {
			return student.ACT_composite;
		}
		else {
			let subjectTests = 0;
			let totalSubjectTestScores = 0;
			for (const property in student) {
				if (property.indexOf('SAT_') >= 0 && property !== "SAT_math" && property !== "SAT_EBRW") {
					if (student[property]) {
						subjectTests++;
						totalSubjectTestScores += student[property];
					}
				}
			}
			let score = (totalSubjectTestScores / (subjectTests * 800)) * subjectTests * 5;
			if (student.ACT_composite === null) {
				return score + (student.SAT_math + student.SAT_EBRW) / 1600 * (100 - subjectTests * 5);
			}
			else if (student.SAT_EBRW === null || student.SAT_math === null) {
				return score + student.ACT_composite / 36 * (100 - subjectTests * 5);
			}
			else {
				let split = 100 - subjectTests * 5;
				return score + (student.SAT_math + student.SAT_EBRW) / 1600 * (split / 2) + student.ACT_composite / 36 * (split / 2);
			}
		}
	}

	//to make point either green yellow or red
	pointColor = (student) => {
		for (let i = 0; i < student.applications.length; i++){
			if (student.applications[i].college === this.props.college.name) {
				if (student.applications[i].status === "denied") {
					return "red";
				}
				else if (student.applications[i].status === "accepted") {
					return "green";
				}
				else {
					return "yellow";
				}
			}
		}
	}

	renderChart = () => {
		let plots = this.props.students.map((student) => { return { x: this.calculateX(student), y: student.GPA }});
		let color = this.props.students.map((student) => { return this.pointColor(student) });
		for (let i = 0; i < plots.length; i++){
			if (plots[i].pointBackgroundColor === "green") {
				plots[i].label = "Accepted";
			}
			else if (plots[i].pointBackgroundColor === "red") {
				plots[i].label = "Denied";
			}
			else {
				plots[i].label = "Other";
			}
		}
		const scatterplotRef = this.scatterplotRef.current.getContext("2d");
		new Chart(scatterplotRef, {
			type: "scatter",
			data: {
				labels: ['Accepted', 'Denied', 'Other'],
				datasets: [
					{
						label: 'Students',
						data: plots,
						pointBackgroundColor: color
					}
				]
			},
			options: {
				scales: {
					yAxes: [{
						scaleLabel: {
							display: true,
							labelString: 'GPA'
						},
						ticks: {
							min: 0,    // minimum will be 0, unless there is a lower value.
							beginAtZero: true,
							max: 4   // minimum value will be 0.
						}
					}],
					xAxes: [{
						scaleLabel: {
							display: true,
							labelString: this.state.testScores
						}
					}]
				}
			}
		}
		);
	}

	componentDidMount() {
		this.setState({ testScores: "SAT" }, this.renderChart);
	}

	render(){
			return (
					<div>
						<canvas
							id="studentScatterplot"
							ref = {this.scatterplotRef}
					/>
					<div>
						<label>
							<input
								type="radio"
								value="SAT"
								checked={this.state.testScores === "SAT"}
								onChange={this.handleChange}
							/>
            SAT
          </label>
						<label>
							<input
								type="radio"
								value="ACT"
								checked={this.state.testScores === "ACT"}
								onChange={this.handleChange}
							/>
            ACT
          </label>
						<label>
							<input
								type="radio"
								value="Test Avg"
								checked={this.state.testScores === "Test Avg"}
								onChange={this.handleChange}
							/>
            Test Avg
          </label>
					</div>	
					</div>
			);
	}
}