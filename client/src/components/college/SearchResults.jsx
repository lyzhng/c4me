import React, { useState } from 'react';
import AppTracker from '../apptracker/AppTracker';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';

function AppTrackerModal(props)
{
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  return (
      <div>
      <Button variant="primary" onClick={handleShow} className="mt-2">
        Launch AppTracker
      </Button>

      <div className="mt-2">
        <Modal show={show} onHide={handleClose} animation={false} size="lg">
          <Modal.Body>
            <AppTracker college={props.college} />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
          </Button>
          </Modal.Footer>
        </Modal>
      </div>
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
      return (
        (this.props.KEY !== nextProps.KEY) 
        || (this.props.college.hidden !== nextProps.college.hidden)
        || (this.props.collegeScore !== nextProps.collegeScore)
        );
    }
    render(){
      if(this.props.college){
        return(
         <div style = {{display : this.props.college.hidden ?  "none" : ""}} className="mb-4">
          {/* <div style={{ border: this.props.college.hidden ? "red solid 10px" : "" }} className="mb-4"> */}
            <h3>{this.props.college.name} (Rank {this.props.college.ranking})</h3>
            <div>{this.props.college.location.city}, {this.props.college.location.state}</div>
            {
              this.props.collegeScore !== null 
              ? <div>
               College Score: {Math.floor((1 - (this.props.collegeScore.score / 20)) * 10000) / 100} 
               </div>
              : ""
            }

            {
              this.props.similarStudents.map((student) => {
                return <Link key = {student._id} to={`/profile/${student.userid}`}><h3>{student.userid}</h3></Link>
              })
            }
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
                    <div><b>Size:</b> {this.props.college.size}</div>
                    <div><b>GPA:</b> {this.props.college.gpa}</div>
                    <div><b>SAT Math Average:</b> {this.props.college.sat.math_avg}</div>
                    <div><b>SAT English Average:</b> {this.props.college.sat.EBRW_avg}</div>
                    <div><b>ACT Average:</b> {this.props.college.act.avg}</div>
                    <div><b>Tuition (in-state / out-of-state):</b> {this.props.college.cost.tuition.in_state} / {this.props.college.cost.tuition.out_state}</div>
                    <div><b>Cost of Attendance (in-state / out-of-state):</b> {this.props.college.cost.attendance.in_state} / {this.props.college.cost.attendance.out_state}</div>
                    <div><b>Admission Rate:</b> {this.props.college.admission_rate}</div>
                    <div><b>Graduation Debt Median:</b> {this.props.college.grad_debt_mdn}</div>
                    <div><b>Graduation Rate:</b> {this.props.college.completion_rate}</div>
                    <br/>
                    <div><b>Description:</b> {this.props.college.description}</div>
                    <br/>
                    <div><b>Majors:</b> {this.props.college.majors.length === 0 ? "NO MAJORS" : this.props.college.majors.reduce((total, current)=>{return total + " | " + current;})}</div>
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