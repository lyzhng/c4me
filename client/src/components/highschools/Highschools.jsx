import React from 'react';
import Axios from 'axios';
import { Redirect } from 'react-router-dom';

function isInt(n) {  //copied from https://stackoverflow.com/questions/5630123/javascript-string-integer-comparisons
    return /^[+-]?\d+$/.test(n);
};

export default class Highschools extends React.Component {

    state = {
        name: "",
        city: "",
        state: "AL",
        highschools: []
    };

    handleChange = (e) => {
        this.setState({
          [e.target.name]: isInt(e.target.value) ? parseInt(e.target.value) : e.target.value,
        }, this.setStateDefault);
    }
    findHighSchools = async (e) => {
        e.preventDefault();
        const query = {
            name: this.state.name,
            city: this.state.city,
            state: this.state.state.toLowerCase(),
        }
        try {
            const resp = await Axios.post("/calculateSimilarHighschools", query);
            this.setState({highschools: resp.data.highschools});
        } catch (e) {
            console.log("Something went wrong in the backend");
        }
        
    }
    render() {
        console.log(this.state.highschools);
        if (this.props.userid) {
            return (
                <div className = "container">
                    <label htmlFor = "name">Name:</label>
                    <input type = "text" onChange = {this.handleChange} name = "name"/>
                    <label htmlFor = "city">City:</label>
                    <input type = "text" onChange = {this.handleChange} name = "city"/>
                    <label htmlFor = "state">State:</label>
                    <select name="state" onChange ={this.handleChange}>
                        <option value="AL">Alabama</option>
                        <option value="AK">Alaska</option>
                        <option value="AZ">Arizona</option>
                        <option value="AR">Arkansas</option>
                        <option value="CA">California</option>
                        <option value="CO">Colorado</option>
                        <option value="CT">Connecticut</option>
                        <option value="DE">Delaware</option>
                        <option value="DC">District of Columbia</option>
                        <option value="FL">Florida</option>
                        <option value="GA">Georgia</option>
                        <option value="HI">Hawaii</option>
                        <option value="ID">Idaho</option>
                        <option value="IL">Illinois</option>
                        <option value="IN">Indiana</option>
                        <option value="IA">Iowa</option>
                        <option value="KS">Kansas</option>
                        <option value="KY">Kentucky</option>
                        <option value="LA">Louisiana</option>
                        <option value="ME">Maine</option>
                        <option value="MD">Maryland</option>
                        <option value="MA">Massachusetts</option>
                        <option value="MI">Michigan</option>
                        <option value="MN">Minnesota</option>
                        <option value="MS">Mississippi</option>
                        <option value="MO">Missouri</option>
                        <option value="MT">Montana</option>
                        <option value="NE">Nebraska</option>
                        <option value="NV">Nevada</option>
                        <option value="NH">New Hampshire</option>
                        <option value="NJ">New Jersey</option>
                        <option value="NM">New Mexico</option>
                        <option value="NY">New York</option>
                        <option value="NC">North Carolina</option>
                        <option value="ND">North Dakota</option>
                        <option value="OH">Ohio</option>
                        <option value="OK">Oklahoma</option>
                        <option value="OR">Oregon</option>
                        <option value="PA">Pennsylvania</option>
                        <option value="RI">Rhode Island</option>
                        <option value="SC">South Carolina</option>
                        <option value="SD">South Dakota</option>
                        <option value="TN">Tennessee</option>
                        <option value="TX">Texas</option>
                        <option value="UT">Utah</option>
                        <option value="VT">Vermont</option>
                        <option value="VA">Virginia</option>
                        <option value="WA">Washington</option>
                        <option value="WV">West Virginia</option>
                        <option value="WI">Wisconsin</option>
                        <option value="WY">Wyoming</option>
                    </select>
                    <button onClick={this.findHighSchools}>Search for HighSchool</button>
                    <div>
                        <h2>Results:</h2>
                        {this.state.highschools.map((hs) => { return <div key = {hs._id}>{hs.name}</div>})}
                    </div>
                </div>
            );
        }
        return <Redirect to="/login" />;
    }
}

