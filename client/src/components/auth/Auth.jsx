import React, { Component } from 'react';
import axios from 'axios';

export default function Auth(AuthorizedComponent) {
  return class extends Component {
    constructor() {
      super();
      this.state = {
        loading: true,
        redirect: false,
        userid: ""
      };
    }

    componentDidMount() {
      axios.get('/checkToken').then(res => {
        if(res.data.user === "admin"){
          this.setState({ loading: false, userid: "admin"});
        }          
        else{
          this.setState({loading: false, userid: res.data.userid});
        }
      }).catch(err => {
        this.setState({ loading: false, redirect: true });
        });
    }


    render() {
      const { loading, redirect } = this.state;
      if (loading) {
        return null;
      }
      if (redirect) {
        return <AuthorizedComponent {...this.props}/>;
      }
      return <AuthorizedComponent {...this.props} userid = {this.state.userid}/>;
    }
  }
}