import React from 'react';
import {
  PageHeader,
  Card,
  Avatar,
  Tag,
  Button,
  Row,
  Col,
  Meta,
  Divider,
  Empty,
  Skeleton,
  Icon,
  Modal
} from 'antd';
import { connect } from 'react-redux';
import route from '../constants/routes';
import { Link } from 'react-router-dom';
import { indexTeamPatient as indexPatient } from '../store/patients';
import { indexTeamULPatient as indexULPatient } from '../store/ULpatients';
import { del as deleteULPatient } from '../store/ULpatients';
import { del as deletePatient } from '../store/patients';

const routes = teamID => [
  {
    path: route.TEAMS,
    breadcrumbName: 'Teams'
  },
  {
    path: `/teams/${teamID}`,
    breadcrumbName: teamID
  }
];

class TeamView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      teamID: null,
      visible: false,
      ULvisible: false,
      delid: "",
      delname: ""
    };
  }

  componentDidMount() {
    this.updateTeam(this.props);
    this.unlisten = this.props.history.listen((location, action) => {
      if (location.pathname.includes("teams")){
        this.updateTeam(this.props);
      }
    });
  }
  
  componentWillUnmount() {
      this.unlisten();
  }

  componentWillReceiveProps(newProps) {
    if (this.props.location.pathname !== newProps.location.pathname) {
      this.updateTeam(newProps);
    }
  }

  delPatient = patientID => {
    setTimeout(() => {
      this.props.deletePatient(patientID).then(this.refresh())
    }, 400);
  }

  ULdelPatient = patientID => {
    setTimeout(() => {
      this.props.deleteULPatient(patientID).then(this.refresh())
    }, 400);
  }

  updateTeam = props => {
    const path = props.location.pathname;
    const teamID = path.split('/')[2];
    this.setState({ teamID });
    setTimeout(() => {
      this.props.indexPatient(this.state.teamID);
      this.props.indexULPatient(this.state.teamID);
    }, 200);
  };

  refresh() {
    setTimeout(() => {
      this.props.indexPatient(this.state.teamID)
        .then(this.props.indexULPatient(this.state.teamID))
        .then(this.setState({}))
        .then(console.log(this.props))
    }, 200);
  }

  delModalOK = id => {
    this.delPatient(id);
    this.setState({ visible: false });
  }

  ULdelModalOK = id => {
    this.ULdelPatient(id);
    this.setState({ ULvisible: false });
  }

  delModalCancel() {
    this.setState({ visible: false, ULvisible: false });
  }

  render() {
    return (
      <div>
        <Modal
          centered={true}
          visible={this.state.visible}
          title="Alert"
          okText={"Delete"}
          cancelText="Cancel"
          onOk={() => this.delModalOK(this.state.delid)}
          onCancel={() => this.delModalCancel()}
        >
          <p>Are you sure to delete the patient <b>{this.state.delname}</b> and all related sessions?</p>
        </Modal>
        <PageHeader
          style={{ background: 'white' }}
          title="Team"
          subTitle="Individual"
          breadcrumb={{ routes: routes(this.state.teamID) }}
          extra={[
            <Button
              key={"update"}
              type="secondary"
              onClick={() => this.refresh()}
              style={{ float: 'right' }}
            >
              <Icon type="reload" />
            </Button>]}
        />
        <div style={{ margin: 20 }}>
          <Divider orientation="left">Facial Paralysis Patients</Divider>
          <Row gutter={16}>
            {!this.props.loading &&
              this.props.patients.map(item => (
                <Col
                  xs={{ span: 100 }}
                  lg={{ span: 12 }}
                  style={{ marginBottom: 20 }}
                >
                  <Card>
                    <Link to={`/patients/${item.id}`}>
                      <Card.Meta
                        avatar={<Avatar icon="user" />}
                        title={item.name}
                        description={
                          <div>
                            <p>
                              Conditions:{' '}
                              {item.conditions.map(condition => (
                                <Tag color="blue" key={"conditiontag" + item.id}>{condition}</Tag>
                              ))}
                            </p>
                            <p>
                              Clinicians:{' '}
                              {item.users.map(user => (
                                <Tag color="cyan" key={"usertag" + item.id}>{user.name}</Tag>
                              ))}
                            </p>
                          </div>
                        }
                      />
                    </Link>
                    <Button
                      key={item.id + "delete"}
                      type="secondary"
                      onClick={() => this.setState({ visible: true, delid: item.id, delname: item.name })}
                      style={{ float: 'right', marginLeft: '.5rem' }}
                    >
                      <Icon type="delete" />
                    </Button>
                  </Card>
                </Col>
              ))}
            <Skeleton active loading={this.props.loading} />
          </Row>
        </div><Modal
          centered={true}
          visible={this.state.ULvisible}
          title="Alert"
          okText={"Delete"}
          cancelText="Cancel"
          onOk={() => this.ULdelModalOK(this.state.delid)}
          onCancel={() => this.delModalCancel()}
        >
          <p>Are you sure to delete the patient <b>{this.state.delname}</b> and all related sessions?</p>
        </Modal>
        <div style={{ margin: 20 }}>
          <Divider orientation="left">Upperlimb Impairment Patients</Divider>
          <Row gutter={16}>
            {!this.props.loading &&
              this.props.ULpatients.map(item => (
                <Col
                  xs={{ span: 100 }}
                  lg={{ span: 12 }}
                  style={{ marginBottom: 20 }}
                >
                  <Card>
                    <Link to={`/ULpatients/${item.id}`}>
                      <Card.Meta
                        avatar={<Avatar icon="user" />}
                        title={item.name}
                        description={
                          <div>
                            <p>
                              Conditions:{' '}
                              {item.conditions.map(condition => (
                                <Tag color="blue" key={"conditiontag" + item.id}>{condition}</Tag>
                              ))}
                            </p>
                            <p>
                              Clinicians:{' '}
                              {item.users.map(user => (
                                <Tag color="cyan" key={"usertag" + item.id}>{user.name}</Tag>
                              ))}
                            </p>
                          </div>
                        }
                      />
                    </Link>
                    <Button
                      key={item.id + "delete"}
                      type="secondary"
                      onClick={() => this.setState({ ULvisible: true, delid: item.id, delname: item.name })}
                      style={{ float: 'right', marginLeft: '.5rem' }}
                    >
                      <Icon type="delete" />
                    </Button>
                  </Card>
                </Col>
              ))}
            <Skeleton active loading={this.props.loading} />
          </Row>
        </div>
      </div>
    );
  };
}

const mapStateToProps = state => ({
  patients: Object.values(state.patients.entities),
  ULpatients: Object.values(state.ULpatients.entities),
  loading: state.patients.status.loading
});

const mapDispatchToProps = dispatch => ({
  indexPatient: (id) => dispatch(indexPatient(id)),
  indexULPatient: (id) => dispatch(indexULPatient(id)),
  deleteULPatient: (id) => dispatch(deleteULPatient(id)),
  deletePatient: (id) => dispatch(deletePatient(id))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TeamView);

const styles = {
  container: {
    margin: 20,
  }
};
