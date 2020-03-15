import React from 'react';

export default class SearchResults extends React.Component {

  state = {

  }
    componentDidMount(){
    	this.setState({college: this.props.college});
    }

    render(){
      if(this.state.college){
        return(
          <div>
            <h3>{this.state.college.name}</h3>
            <span>{this.state.college.location.city}, {this.state.college.location.state}</span>
          </div>
        )
      }
      else{
        return null
      }
    }
   
}