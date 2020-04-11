import React from 'react';
import AppTracker from '../components/apptracker/AppTracker';

export default class SearchResults extends React.Component {


    // componentDidMount(){
    // 	this.setState({college: this.props.college});
    // }
    //<div> {this.props.college.description}</div>
    //<div> majors: {this.props.college.majors.reduce((total, current)=>{return total + "|" + current;})}</div>
    render(){
      if(this.props.college){
        return(
          <div style = {{border : this.props.college.hidden ?  "2px dashed red" : ""}}>
            <h3>{this.props.college.name} rank: {this.props.college.ranking}</h3>
            <div>{this.props.college.location.city}, {this.props.college.location.state}</div>
            <div> size: {this.props.college.size}</div>
            <div> SAT Math avg: {this.props.college.sat.math_avg}</div>
            <div> SAT Eng avg: {this.props.college.sat.EBRW_avg}</div>
            <div> ACT avg: {this.props.college.act.avg}</div>
            <div> cost of attendance: {this.props.college.cost.attendance.in_state}</div>
            <div> admission_rate: {this.props.college.admission_rate}</div>
            {/* <div> majors: {this.props.college.majors.reduce((total, current)=>{return total + "|" + current;})}</div> */}
          </div>
        )
      }
      else{
        return null
      }
    }
   
}