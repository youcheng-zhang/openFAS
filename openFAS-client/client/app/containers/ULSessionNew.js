import React from 'react';
import { connect } from 'react-redux';
import * as sessionActions from '../store/ULsessions';
import ULSessionNewConfigure from './ULSessionNewConfigure';
import ULSessionNewBodyPosition from './ULSessionNewBodyPosition';
import ULSessionNewExercise from './ULSessionNewExercise';
import ULSessionNewFeedback from './ULSessionNewFeedback';
import { Stages } from '../constants/session';

class ULSessionNew extends React.Component {
  state = {
    stage: Stages.CONFIGURE,
    rgbStream: null
  };

  componentDidMount() {
    this.openRgbStreams();
  }

  componentWillUnmount() {
    this.closeRgbStreams();
  }

  openRgbStreams = () => {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then(rgbStream => this.setState({ rgbStream }));
  }

  closeRgbStreams = () => {
    this.state.rgbStream && this.state.rgbStream.getTracks().forEach(track => track.stop());
  }

  transitionStage = stage => this.setState({ stage });

  BodyPositionComponent = () => (
    <ULSessionNewBodyPosition
      rgbStream={this.state.rgbStream}
      handleSubmit={() => {
        this.transitionStage(Stages.EXERCISES);
        this.closeRgbStreams();
      }}
    />
  );

  ExerciseComponent = () => (
    <ULSessionNewExercise
      exerciseId={this.props.session.exercise}
      handleSubmit={() => this.transitionStage(Stages.FEEDBACK)}
    />
  );

  selectStage = stage =>
    ({
      [Stages.CONFIGURE]: this.BodyPositionComponent(),
      [Stages.HEAD_POSITION]: this.BodyPositionComponent(),
      [Stages.EXERCISES]: this.ExerciseComponent(),
      [Stages.FEEDBACK]: this.ExerciseComponent()
    }[stage] || <></>);

  render() {
    const StageComponent = this.selectStage(this.state.stage);
    return (
      <div style={styles.container}>
        {/* Modals */}
        <ULSessionNewConfigure
          visible={this.state.stage === Stages.CONFIGURE}
          handleSubmit={() => this.transitionStage(Stages.HEAD_POSITION)}
        />
        <ULSessionNewFeedback visible={this.state.stage === Stages.FEEDBACK} />
        {/* Stage */}
        {StageComponent}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  session: state.ULsessions.entity
});

const mapDispatchToProps = dispatch => ({
  updateSession: (id, data) => dispatch(sessionActions.update(id, data))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ULSessionNew);

const styles = {
  container: {
    height: '100vh',
    backgroundColor: '#3f3f3f'
  }
};
