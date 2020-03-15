import React from 'react';

export default class SearchResults extends React.Component {
    state = {
        name:"",
    }

    componentDidMount(){

    }

    render(){
        <div>
            <h3>{this.state.name}</h3>

        </div>
    }
}