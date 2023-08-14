import React from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { Carousel, Typography, Icon, message } from 'antd';
import * as sessionActions from '../store/sessions';
import * as exercisesActions from '../store/exercises';
import { Status } from '../constants/session';
import BeepSound from '../assets/beepSound.mp3';
import _ from 'lodash';

class SessionNewExercise extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      recording: true,
      index: 0,
      movementTimings: {},
      started: false
    };
  }

  componentDidMount() {
    this.beep = new Audio(BeepSound);
    this.props.loading && message.loading('Fetching exercise...', 0);
    this.props.getExercise(this.props.exerciseId);
  }

  componentWillReceiveProps(newProps) {
    !_.isEqual(newProps.exercise, {}) &&
      !this.state.started &&
      this.startExercise(newProps.exercise);
  }

  componentWillUnmount() {
    clearTimeout(this.timedEvent);
  }

  startExercise = exercise => {
    this.setState({ started: true });
    this.imgUrl = exercise.movements[this.state.index].imageUrl;
    this.timedEvent = setTimeout(() => {
      this.record(this.state.index);
    }, 4000);
  };

  record = currentIndex => {
    const movements = this.props.exercise.movements;
    const movement = movements[currentIndex];
    this.imgUrl = movement.imageUrl;
    // update index and initialise time for current exercise
    // TODO: figure out why it takes a while for the camera to start
    this.timedEvent = setTimeout(() => {
      this.setState({ index: currentIndex + 1 }, () => {
        this.setState({
          movementTimings: {
            ...this.state.movementTimings,
            [movement._id]: {
              fromTime: new Date()
            }
          }
        });
      });
    }, movement.duration * 200);
    const apiBody = {
      sessionid: this.props.session.id,
      movementid: movement._id,
      time: movement.duration
    };
    // start recording movement
    axios
      .post(`${process.env.ANALYSER_URI}/record`, apiBody)
      .then(() => {
        // start processing results
        axios
          .post(`${process.env.ANALYSER_URI}/process`, apiBody)
          .catch(error => console.log(error.response));

        // show complete recording icon
        this.setState({ recording: false });

          // transition to next exercise
        // if last exercise, update session and transition to next step
        this.timedEvent = setTimeout(() => {
            if (this.state.index === movements.length) {
            this.handleSubmit();
          }
          // otherwise transition to next exercise
          else if (this.state.index === currentIndex + 1) {
            this.refs.carousel.next();
          }
        }, 1000)
      })
      .catch(() => {
        // re-record on error
        message.error(
          `Unable to record ${movement._id}. Retrying recording.`
        );
      });
    // play sound at maximal facial expression
    this.timedEvent = setTimeout(() => {
      this.beep.play();
    }, movement.maximalDuration * 1000);
  };

  handleSubmit = () => {
    const { movementTimings } = this.state;
    this.props.updateSession(this.props.session.id, {
      movementTimings,
      endTime: new Date(),
      status: Status.PENDING
    });
    this.props.handleSubmit && this.props.handleSubmit();
  };

  render() {
    return (
      <div style={styles.container}>
        {!this.props.loading && this.props.exercise.movements && (
          <Carousel
            ref="carousel"
            dotPosition="bottom"
            beforeChange={() => this.setState({ recording: true })}
            afterChange={this.record}
          >
            {this.props.exercise.movements.map((exercise, index) => (
              <div key={exercise._id}>
                <div style={styles.exerciseContainer}>
                  <Typography.Title style={styles.title}>
                    {exercise.name}
                  </Typography.Title>
                  <img src={this.imgUrl} style={styles.image} />
                  {this.state.recording ? (
                    <Icon
                      type="loading-3-quarters"
                      style={styles.recordingIcon}
                      spin
                    />
                  ) : (
                    <Icon
                      type="check-circle"
                      theme="twoTone"
                      twoToneColor="#52c41a"
                      style={styles.finishedRecordingIcon}
                    />
                  )}
                </div>
              </div>
            ))}
          </Carousel>
        )}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  session: state.sessions.entity,
  exercise: state.exercises.entity,
  loading: state.exercises.status.loading
});

const mapDispatchToProps = dispatch => ({
  updateSession: (id, data) => dispatch(sessionActions.update(id, data)),
  getExercise: id => dispatch(exercisesActions.get(id))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SessionNewExercise);

const styles = {
  container: {
    height: '100vh'
  },
  exerciseContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: '2em',
    height: '99vh'
  },
  image: {
    height: 'auto',
    width: '70vw'
  },
  title: {
    color: 'white',
    fontSize: '3.5em'
  },
  recordingIcon: {
    color: 'red',
    fontSize: '5em'
  },
  finishedRecordingIcon: {
    fontSize: '5em'
  }
};
