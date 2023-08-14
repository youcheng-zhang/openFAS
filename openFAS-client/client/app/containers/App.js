// @flow
import * as React from 'react';
import Container from './Container';
import Login from './Login';
import { connect } from 'react-redux';

class App extends React.Component {
  render() {
    return this.props.user.status.success === true ? (
      <Container children={this.props.children} />
    ) : (
      <Login />
    );
  }
}

const mapStateToProps = state => ({
  user: state.user
});

const mapDispatchToProps = dispatch => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
