import React from 'react';
import { PageHeader, Card } from 'antd';
import route from '../constants/routes';
import { index } from '../store/sessions';
import { connect } from 'react-redux';
import SessionExplorer from '../components/SessionExplorer';

const routes = [
  {
    path: route.SESSIONS,
    breadcrumbName: 'Sessions'
  },
  {
    path: route.SESSIONS,
    breadcrumbName: 'My Sessions'
  }
];

class Sessions extends React.Component {
  componentDidMount() {
    this.props.index();
  }
  
  refresh() {
    this.props.index().then(this.setState({ }))
  }

  render() {
    return (
      <div>
        <PageHeader
          style={{ background: 'white' }}
          title="My Sessions"
          subTitle="All sessions administered by the user."
          breadcrumb={{ routes }}
        />
        <SessionExplorer
          loading={this.props.loading}
          sessions={Object.values(this.props.sessions)}
          refresh={this.refresh.bind(this)}
        />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  sessions: state.sessions.entities,
  loading: state.sessions.status.loading
});

const mapDispatchToProps = dispatch => ({
  index: () => dispatch(index())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Sessions);

const styles = {
  container: {
    margin: 20
  }
};
