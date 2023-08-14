import React from 'react';
import { PageHeader, Card } from 'antd';
import route from '../constants/routes';
import { index } from '../store/ULsessions';
import { connect } from 'react-redux';
import ULSessionExplorer from '../components/ULSessionExplorer';
const routes = [
  {
    path: route.ULSESSIONS,
    breadcrumbName: 'Sessions'
  },
  {
    path: route.ULSESSIONS,
    breadcrumbName: 'My Sessions'
  }
];

class ULSessions extends React.Component {
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
        <ULSessionExplorer
          loading={this.props.loading}
          sessions={Object.values(this.props.sessions)}
          refresh={this.refresh.bind(this)}
        />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  sessions: state.ULsessions.entities,
  loading: state.ULsessions.status.loading
});

const mapDispatchToProps = dispatch => ({
  index: () => dispatch(index())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ULSessions);

const styles = {
  container: {
    margin: 20
  }
};
