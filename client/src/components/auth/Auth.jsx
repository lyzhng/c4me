import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import axios from 'axios'
export default function Auth(AuthorizedComponent) {
  return class extends Component {
    constructor() {
      super();
      this.state = {
        loading: true,
        redirect: false,
        admin: -1
      };
    }

    componentDidMount() {
      axios.get('/checkToken').then(res => {
        if(res.data.status === "admin"){
          this.setState({ loading: false, admin: 1});
        }          
        else{
          this.setState({loading: false, admin: 0});
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
        return <Redirect to="/login" />;
      }
      return <AuthorizedComponent {...this.props} />;
    }
  }
}