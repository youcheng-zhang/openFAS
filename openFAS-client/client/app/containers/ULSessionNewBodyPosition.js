import React from 'react';
import _ from 'lodash';
import { Typography, Button } from 'antd';
import { connect } from 'react-redux';
import { Status } from '../constants/session';
import * as sessionActions from '../store/ULsessions';

class SessionNewHeadPosition extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rgbStream: null
    };
    this.videoRef = React.createRef();
    this.canvasRef = React.createRef();
  }

  componentDidMount() {
    this.drawBodyPosition();
    this.props.rgbStream && this.handleStream(this.props.rgbStream);
  }

  componentWillReceiveProps(newProps) {
    newProps.rgbStream && this.handleStream(newProps.rgbStream);
  }

  componentWillUnmount() {
    this.state.rgbStream &&
      this.state.rgbStream.getTracks().forEach(track => track.stop());
  }

  handleStream = rgbStream => {
    if (!_.isEqual(this.state.rgbStream, rgbStream)) {
      this.setState({ rgbStream }, () => {
        this.videoRef.current.srcObject = rgbStream;
        this.videoRef.current.play();
      });
    }
  };

  handleSubmit = () => {
    this.props.updateSession(this.props.session.id, {
      beginTime: new Date(),
      status: Status.IN_PROGRESS
    });
    this.props.handleSubmit();
  };

  drawBodyPosition = () => {
    const canvasElement = this.canvasRef.current;
    const canvasContext = canvasElement.getContext('2d');
    const height = canvasElement.height / 1;
    const width = canvasElement.width / 4;
    const centerX = canvasElement.width / 2;
    const centerY = canvasElement.height / 2;
    // draw rectangle
    canvasContext.rect(centerX-width/2, centerY-height/6, width, height);
    canvasContext.fillStyle = 'rgba(0, 0, 300, 0.2)';
    canvasContext.fill();
    canvasContext.closePath();
  };

  render() {
    return (
      <div style={styles.container}>
        <Typography.Title style={styles.title}>
          Please Sit In The Blue Area
        </Typography.Title>
        <div style={styles.videoCanvasContainer}>
          <video ref={this.videoRef} style={styles.video} preload="auto" />
          <canvas ref={this.canvasRef} style={styles.canvas} />
        </div>
        <Button
          type="primary"
          style={styles.button}
          size="large"
          onClick={this.handleSubmit}
        >
          Begin Session
        </Button>
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
)(SessionNewHeadPosition);

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1em'
  },
  videoCanvasContainer: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center'
  },
  video: {
    position: 'absolute',
    height: '75vh'
  },
  canvas: {
    height: '75vh',
    position: 'relative',
    zIndex: 10
  },
  button: {
    width: '50%',
    height: 'auto',
    padding: '.3em',
    fontSize: '2em'
  },
  title: {
    color: 'white',
    fontSize: '3.5em'
  }
};
