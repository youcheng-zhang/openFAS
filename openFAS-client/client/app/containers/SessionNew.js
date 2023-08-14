import React from 'react';
import { connect } from 'react-redux';
import * as sessionActions from '../store/sessions';
import SessionNewConfigure from './SessionNewConfigure';
import SessionNewHeadPosition from './SessionNewHeadPosition';
import SessionNewExercise from './SessionNewExercise';
import SessionNewFeedback from './SessionNewFeedback';
import { Stages } from '../constants/session';

class SessionNew extends React.Component {
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
      .getUserMedia({ video: { videoKind: {exact: "depth"} } })
      .then(rgbStream => this.setState({ rgbStream }));
  }

  closeRgbStreams = () => {
    this.state.rgbStream && this.state.rgbStream.getTracks().forEach(track => track.stop());
  }

  transitionStage = stage => this.setState({ stage });

  HeadPositionComponent = () => (
    <SessionNewHeadPosition
      rgbStream={this.state.rgbStream}
      handleSubmit={() => {
        this.transitionStage(Stages.EXERCISES);
        this.closeRgbStreams();
      }}
    />
  );

  ExerciseComponent = () => (
    <SessionNewExercise
      exerciseId={this.props.session.exercise}
      handleSubmit={() => this.transitionStage(Stages.FEEDBACK)}
    />
  );

  selectStage = stage =>
    ({
      [Stages.CONFIGURE]: this.HeadPositionComponent(),
      [Stages.HEAD_POSITION]: this.HeadPositionComponent(),
      [Stages.EXERCISES]: this.ExerciseComponent(),
      [Stages.FEEDBACK]: this.ExerciseComponent()
    }[stage] || <></>);

  render() {
    const StageComponent = this.selectStage(this.state.stage);
    return (
      <div style={styles.container}>
        {/* Modals */}
        <SessionNewConfigure
          visible={this.state.stage === Stages.CONFIGURE}
          handleSubmit={() => this.transitionStage(Stages.HEAD_POSITION)}
        />
        <SessionNewFeedback visible={this.state.stage === Stages.FEEDBACK} />
        {/* Stage */}
        {StageComponent}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  session: state.sessions.entity
});

const mapDispatchToProps = dispatch => ({
  updateSession: (id, data) => dispatch(sessionActions.update(id, data))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SessionNew);

const styles = {
  container: {
    height: '100vh',
    backgroundColor: '#3f3f3f'
  }
};
