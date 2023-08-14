import React from 'react';
import { connect } from 'react-redux';
import { Modal, Result, Icon, Rate } from 'antd';
import { withRouter } from 'react-router-dom';
import routes from '../constants/routes';
import * as appActions from '../store/app';
import * as sessionActions from '../store/ULsessions';

class ULSessionNewFeedback extends React.Component {
  handleSubmit = patientRating => {
    this.props.updateSession(this.props.session.id, {
      patientRating
    });
    this.props.toggleLayoutDefault();
    this.props.handleSubmit && this.props.handleSubmit();
    this.props.history.push(routes.ULSESSIONS);
  };

  render() {
    return (
      <Modal
        centered={true}
        visible={this.props.visible}
        footer={null}
        closable={false}
      >
        <Result
          icon={<Icon type="smile" theme="twoTone" />}
          title="Tell us how that went."
          extra={<Rate onChange={this.handleSubmit} />}
        />
      </Modal>
    );
  }
}

const mapStateToProps = state => ({
  session: state.ULsessions.entity
});

const mapDispatchToProps = dispatch => ({
  toggleLayoutDefault: () => dispatch(appActions.toggleLayoutDefault()),
  updateSession: (id, data) => dispatch(sessionActions.update(id, data))
});

const ConnectedULSessionNewFeedback = connect(
  mapStateToProps,
  mapDispatchToProps
)(ULSessionNewFeedback);

export default withRouter(ConnectedULSessionNewFeedback);
