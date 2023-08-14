import React from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { Modal, Button, Select, List, Statistic, Skeleton } from 'antd';
import { Carousel, Typography, Icon, message } from 'antd';
import * as sessionActions from '../store/ULsessions';
import * as exercisesActions from '../store/ULexercises';
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
      started: false,
      visible: false,
      countDown: 5
    };
  }

  componentDidMount() {
    this.beep = new Audio(BeepSound);
    this.props.loading && message.loading('Fetching exercise...', 0);
    this.props.getExercise(this.props.exerciseId);

    setInterval(() => {
      if (this.state.visible) {
        if (this.state.countDown < 1) {
          this.RetryOK();
          this.setState({ countDown: 5 });
        } else {
          this.setState({ countDown: this.state.countDown - 1 });
        }
      }
    }, 1000)
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

  record_current = (apiBody, movements, currentIndex) => axios
    .post(`${process.env.ANALYSER_URI}/ULrecord`, apiBody)
    .then(() => {
      // start processing results
      axios
        .post(`${process.env.ANALYSER_URI}/ULprocess`, apiBody)
        .catch(error => console.log(error.response));

      // show complete recording icon
      this.setState({ recording: false });

      // transition to next exercise
      // if last exercise, update session and transition to next step
      this.timedEvent = setTimeout(() => {
        this.setState({ visible: true })
      }, 1000)
    })
    .catch(() => {
      // re-record on error
      const movement = movements[currentIndex];
      message.error(
        `Unable to record ${movement._id}. Retrying recording.`
      );
    });


  record = currentIndex => {
    const movements = this.props.exercise.movements;
    const movement = movements[currentIndex];
    this.imgUrl = movement.imageUrl;
    // update index and initialise time for current exercise
    // TODO: figure out why it takes a while for the camera to start
    this.timedEvent = setTimeout(() => {
      this.setState({ index: currentIndex }, () => {
        this.setState({
          movementTimings: {
            ...this.state.movementTimings,
            [movement._id]: {
              fromTime: new Date()
            }
          }
        });
      });
    }, movement.duration * 2);
    const apiBody = {
      sessionid: this.props.session.id,
      movementid: movement.order,
      time: movement.duration
    };
    // start recording movement
    this.record_current(apiBody, movements, currentIndex);
    // play sound at the start of the movement
    this.timedEvent = setTimeout(() => {
      this.beep.play();
    }, movement.duration * 10);
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

  RetryOK = () => {
    const movements = this.props.exercise.movements;
    this.setState({ visible: false })
    if (this.state.index === movements.length - 1) {
      this.handleSubmit();
    }
    else {
      this.refs.carousel.next();
    }
  }

  RetryCancel = () => {
    this.setState({ visible: false, recording: true, countDown: 5 })
    this.record(this.state.index);
  }

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
                  <video src={this.imgUrl} style={styles.image} autoPlay={true} loop muted />
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
                  <Modal
                    centered={true}
                    visible={this.state.visible}
                    title="Retry"
                    okText={"Continue (" + this.state.countDown + ")"}
                    cancelText="Retry"
                    onOk={this.RetryOK}
                    onCancel={this.RetryCancel}
                  >
                    <p>Would you like to retry this exercise?</p>
                  </Modal>
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
  session: state.ULsessions.entity,
  exercise: state.ULexercises.entity,
  loading: state.ULexercises.status.loading
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
