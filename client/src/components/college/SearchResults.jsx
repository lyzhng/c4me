import React from 'react';

export default class SearchResults extends React.Component {
    state = {
    	name:"",
    }

    componentDidMount(){
    	this.setState({name: this.props.name});
    }

    render(){
        <div>
          <h3>{this.state.name}</h3>
        </div>
    }
}