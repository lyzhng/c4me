import React from 'react';
import Chart from 'chart.js';
import * as ChartAnnotation from "chartjs-plugin-annotation";
import { Scatter } from 'react-chartjs-2';

export default class Scatterplot extends React.Component{
	scatterplotRef = React.createRef();

	state = {
		testScores: "SAT",
		data: {},
		options:{}
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
		console.log("Rendering chart");
		let minX, maxX = 0;
		let maxTickX = null;
		if (this.state.testScores === "SAT") {
			minX = 400;
			maxX = 1600;
		}
		else if (this.state.testScores === "ACT") {
			minX = 0;
			maxTickX = 3;
			maxX = 36
		}
		else {
			minX = 0;
			maxX = 100;
		}
		let plots = this.props.students.filter((student) => {return student.SAT_EBRW && student.SAT_math}).map((student) => { if(!student.hidden) return { x: this.calculateX(student), y: student.GPA }});
		let color = this.props.students.filter((student) => { return student.SAT_EBRW && student.SAT_math }).map((student) => { if (!student.hidden) return this.pointColor(student) });
		let avgGPA = 0;
		let avgTest = 0;
		let plotNumber = 0;
		for (let i = 0; i < plots.length; i++){
 			if (plots[i]) {
				plotNumber++;
				avgGPA += plots[i].y;
				avgTest += plots[i].x;
			}
		}
		avgGPA = avgGPA / plotNumber;
		avgTest = avgTest / plotNumber;
    let data = {
        datasets: [
          {
            data: plots,
            pointBackgroundColor: color,
          },
        ],
			}
		
		let options = {
			legend: {
				display: false,
			},
			scales: {
				yAxes: [
					{
						scaleLabel: {
							display: true,
							labelString: "GPA",
						},
						ticks: {
							min: 0, // minimum will be 0, unless there is a lower value.
							beginAtZero: true,
							max: 4, // minimum value will be 0.
						},
					},
				],
				xAxes: [
					{
						scaleLabel: {
							display: true,
							labelString: this.state.testScores,
						},
						ticks: {
							min: minX,
							stepSize: maxTickX,
							max: maxX,
						},
					},
				],
			},
			annotation: {
				annotations: [
					{
						type: "line",
						mode: "horizontal",
						scaleID: "y-axis-1",
						value: avgGPA,
						borderColor: "grey",
						borderWidth: 2,
						borderDash: [2, 3],
						label: {
							enabled: false,
							content: "Test label",
						},
					},
					{
						type: "line",
						mode: "vertical",
						scaleID: "x-axis-1",
						value: avgTest,
						borderColor: "grey",
						borderWidth: 2,
						borderDash: [2, 3],
						label: {
							enabled: false,
							content: "Test label",
						},
					},
				],
			},
		}
	this.setState({ data: data, options: options });
	}

	componentDidMount() {
		this.setState({ testScores: "SAT" }, this.renderChart);
	}

	render(){
			return (
					<div>
					<Scatter
						id="studentScatterplot"
						ref={this.scatterplotRef}
						data={this.state.data}
						options={this.state.options}
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