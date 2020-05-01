import React from 'react';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import {Redirect, Link} from 'react-router-dom';


export default class HomeScreen extends React.Component{
    state = {
      userid :""
    };

    componentDidMount(){
      if((this.props.userid && this.props.userid) !== "admin"){
        this.setState({userid:this.props.userid});
        console.log(1);
      }
      else if(this.props.userid && this.props.userid === "admin"){
        this.setState({userid:"admin"});
        console.log(2);
      }
      else{
        this.setState({userid:""});
        console.log(3);
      }
    }

    loginRedirect(){
      if(this.props.userid != ""){
        return true;
      }
      else{
        return false;
      }
    }

    render(){
      const responsive = {
        desktop: {
          breakpoint: {
            max: 2000,
            min: 900
          },
          items: 3,
          partialVisibilityGutter: 40
        },
        mobile: {
          breakpoint: {
            max: 600,
            min: 464
          },
          items: 1,
          partialVisibilityGutter: 30
        },
        tablet: {
          breakpoint: {
            max: 900,
            min: 600
          },
          items: 2,
          partialVisibilityGutter: 30
        }};

        return(
          <div className="home-screen">
            <div id="myCarousel" className="carousel slide" data-ride="carousel">
              <ol className="carousel-indicators">
                <li data-target="#myCarousel" data-slide-to="0" className="active"/>
                <li data-target="#myCarousel" data-slide-to="1"/>
                <li data-target="#myCarousel" data-slide-to="2"/>
              </ol>
              <div className="carousel-inner">
                <div className="carousel-item active">
                  <div className="carousel-caption">
                    <h1 className="headerFront">c4Me</h1>
                    <p className="paragraph">c4Me is made for student who about to graduate from high school and let them
                      find the most fit colleges also see how other student do if they have similar high school or
                      applied for same college.
                    </p>
                  </div>
                  <img className="d-block w-100 Graduate"
                       height={1000}
                       // src={require("../image/Graduate.jpeg")}
                       // alt="First slide"
                  />
                </div>
                <div className="carousel-item">
                  <div className="carousel-caption">
                    <p className="paragraph paragraph-center">
                      c4Me have different feature such as, college search, college recommeder, Application Tracker,
                      and find similar high school to help student target the college for their future.
                    </p>
                  </div>
                  <img className="d-block w-100 College"
                       height={1000}
                       // src={require("../image/Colleges.jpeg")}
                       // alt="Second slide"
                  />
                </div>
                <div className="carousel-item">
                  <div className="carousel-caption">
                    <p className="paragraph paragraph-center">
                      c4Me's purpose this help those student who about to graduate When they are confused about the choice of future universities,
                      c4Me can provide some help and direction, and at the same time,
                      student can understand what kind of university they can enter and best college that meet their preference.
                    </p>
                  </div>
                  <img className="d-block w-100 Students"
                       height={1000}
                       // src={require("../image/college_student.jpg")}
                       // alt="Third slide"
                      />
                </div>
              </div>
              <a className="carousel-control-prev" href="#myCarousel" role="button" data-slide="prev">
                <span className="carousel-control-prev-icon" aria-hidden="true"/>
                <span className="sr-only">Previous</span>
              </a>
              <a className="carousel-control-next" href="#myCarousel" role="button" data-slide="next">
                <span className="carousel-control-next-icon" aria-hidden="true"/>
                <span className="sr-only">Next</span>
              </a>
            </div>


            <div class = "divHS">
              <h3 className="word-white">Get Start With Our Tools</h3>
              <br/>
              <Carousel
                arrows={false}
                swipeable={false}
                draggable={false}
                responsive={responsive}
                ssr={true} // means to render carousel on server-side.
                infinite={true}
                autoPlay={true}
                autoPlaySpeed={2500}
                keyBoardControl={true}
                customTransition="all .5"
                transitionDuration={500}
                containerClass="carousel-container"
                dotListClass="custom-dot-list-style"
                itemClass="carousel-item-padding-40-px"
              >
                <div class = "wrapperHS">
                  <a class="slide__content dark-text" href={this.loginRedirect()? "/colleges":"/login"}>
                    <span  class = "tool-btn">
                      <img src={require("../image/Search-btn.png")} alt={"Search Button"} className="icon-inline"/>
                      College Search
                    </span>
                    Find the College You Enter
                  </a>
                </div>
                <div class = "wrapperHS">
                  <a class="slide__content dark-text" href={this.loginRedirect()? "/highschools" : "/login"  }>
                    <span class ="tool-btn">
                      <img src={require("../image/HS.png")} alt={"HS Button"} className="icon-inline"/>
                      Similar High School
                    </span>
                    Find find High school that similar to you, and check their status
                  </a>
                </div>
                <div class = "wrapperHS">
                  <a class="slide__content dark-text" href={this.loginRedirect() ? "/colleges" : "/login"}>
                    <span className="tool-btn">
                      <img src={require("../image/thumbs up.png")} alt={"Recommend Button"} className="icon-inline"/>
                      College Recommender
                    </span>
                    Find colleges that must fit your status
                  </a>
                </div>
                <div class = "wrapperHS">
                  <a class="slide__content dark-text" href={this.loginRedirect() ? "/colleges" : "/login"}>
                    <span className="tool-btn">
                      <img src={require("../image/apptracker.png")} alt={"AppTracker Button"} className="icon-inline"/>
                      Application Tracker
                    </span>
                    Track your application status
                  </a>
                </div>
              </Carousel>
            </div>
            <br/>
            <br/>
            <br/>

            <div class="section">
              <div className="split-box">
                <div className="split-box__content">
                  <div className="section-header">
                    College Search
                  </div>
                  <div className="section-contest">
                    Search over colleges and filter to find the schools that match your preferences,
                    and get all the detail on admission, academics, cost and application status.
                  </div>
                  <div className="box">
                    <a href={this.loginRedirect() ? "/colleges" : "/login"} className="btn-1 btn-blue btn-animation-1">Test
                      Yourself</a>
                  </div>
                </div>
                <div className="split-box__image">
                  <img src={require("../image/college_search.jpg")} alt={"college Search"}/>
                </div>

              </div>
            </div>
            <div className="section-1">
              <div className="split-box">
                <div className="split-box__image">
                  <img src={require("../image/Application.png")} alt={"Application Tracker"}/>
                </div>
                <div className="split-box__content">
                  <div className="section-header">
                    Application Tracker
                  </div>
                  <div className="section-contest">
                    Search over colleges and filter to find the schools that match your preferences,
                    and go to a specific college and click Application Tracker, that will show the statics of the college.
                    You can see the who's apply to the college and see the application status by the list and scatter plot.
                  </div>
                  <div class="box">
                    <a href={this.loginRedirect()? "/colleges":"/login"} class="btn-1 btn-white btn-animation-1">Test Yourself</a>
                  </div>
                </div>

              </div>
            </div>

            <div className="section">
              <div className="split-box">

                <div className="split-box__content">
                  <div className="section-header">
                    College Recommender
                  </div>
                  <div className="section-contest">
                    College recommender will help the student find the college that fit them by given match score of each college. Those score
                    is according to student's academics, admission and cost/aid.
                  </div>
                  <div className="box">
                    <a href={this.loginRedirect() ? "/colleges" : "/login"} className="btn-1 btn-blue btn-animation-1">Test
                      Yourself</a>
                  </div>
                </div>

                <div className="split-box__image">
                  <img src={require("../image/Application.png")} alt={"Application Tracker"}/>
                </div>

              </div>
            </div>
            <div className="section-1">
              <div className="split-box">
                <div className="split-box__image">
                  <img src={require("../image/Find_Similar_HS.png")} alt={"Application Tracker"}/>
                </div>
                <div className="split-box__content">
                  <div className="section-header">
                    Find Similar High School
                  </div>
                  <div className="section-contest">
                    Search over all high school that you specified, and get all the high school that's similar to
                    your specified by given score of similarity.
                  </div>
                  <div className="box">
                    <a href={this.loginRedirect() ? "/highschools" : "/login"} className="btn-1 btn-white btn-animation-1">Test
                      Yourself</a>
                  </div>
                </div>

              </div>
            </div>
            <div className="post">
              <div className="team-header">
                Made by Team: Alternative Flow
              </div>
              <div className="team-member">
                Lily Zhong, Harrison Ngan, Samuel Chen, Peilin Zhu
              </div>
              <img src={require("../image/Alternative.png")} alt={"Alternative Flow"}/>
            </div>

          </div>

        )
    }
}
