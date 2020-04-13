import React, { useState } from 'react';
import AppTracker from '../apptracker/AppTracker';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';

function AppTrackerModal(props)
{
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  return (
      <div>
      <Button variant="primary" onClick={handleShow}>
        Launch AppTracker
      </Button>

      <Modal show={show} onHide={handleClose} animation={false} size = "lg">
        <Modal.Body>
          <AppTracker college = {props.college}/>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
    )
}

export default class SearchResults extends React.Component {


    // componentDidMount(){
    // 	this.setState({college: this.props.college});
    // }
    //<div> {this.props.college.description}</div>
    //<div> majors: {this.props.college.majors.reduce((total, current)=>{return total + "|" + current;})}</div>
    shouldComponentUpdate(nextProps) {
      return ((this.props.KEY !== nextProps.KEY) || (this.props.college.hidden !== nextProps.college.hidden));
    }
    render(){
      if(this.props.college){
        return(
          <div style = {{display : this.props.college.hidden ?  "none" : ""}}>
            <h3>{this.props.college.name} rank: {this.props.college.ranking}</h3>
            <div>{this.props.college.location.city}, {this.props.college.location.state}</div>
            <AppTrackerModal college = {this.props.college}/>

            <Accordion>
              <Card>
                <Card.Header>
                  <Accordion.Toggle as={Button} variant="link" eventKey="0">
                    More Info
                  </Accordion.Toggle>
                </Card.Header>
                <Accordion.Collapse eventKey="0">
                  <Card.Body>
                    <div> size: {this.props.college.size}</div>
                    <div> SAT Math avg: {this.props.college.sat.math_avg}</div>
                    <div> SAT Eng avg: {this.props.college.sat.EBRW_avg}</div>
                    <div> ACT avg: {this.props.college.act.avg}</div>
                    <div> tuition (instate/outstate): {this.props.college.cost.tuition.in_state} / {this.props.college.cost.tuition.out_state}</div>
                    <div> cost of attendance (instate/outstate): {this.props.college.cost.attendance.in_state} / {this.props.college.cost.attendance.out_state}</div>
                    <div> admission_rate: {this.props.college.admission_rate}</div>
                    <div> graduation debt median: {this.props.college.grad_debt_mdn}</div>
                    <div> graduation rate: {this.props.college.completion_rate}</div>
                    <div> majors: {this.props.college.majors.reduce((total, current)=>{return total + "|" + current;})}</div>
                  </Card.Body>
                </Accordion.Collapse>
              </Card>
            </Accordion>
          </div>
        )
      }
      else{
        return null
      }
    }
   
}