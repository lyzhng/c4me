import React from 'react';
import AppTracker from '../apptracker/AppTracker';

export default class College extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        // sample college
        const college = {
            name: 'Stony Brook University',
            ranking: 1,
            location: 'NY, NY'
        }
        return (
            <div className="container-fluid">
                <h1>College Component</h1>
                <AppTracker college={college}/>
            </div>  
        );
    }
}