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
import route from '../constants/routes';
import { connect } from 'react-redux';
import { index } from '../store/patients';
import { Link } from 'react-router-dom';
import { del as deletePatient } from '../store/patients';

const routes = [
  {
    path: route.PATIENTS,
    breadcrumbName: 'Patients'
  },
  {
    path: route.PATIENTS,
    breadcrumbName: 'All Patients'
  }
];

class Patients extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      delid: "",
      delname: ""
    };
  }

  componentDidMount() {
    this.props.index();
  }

  delPatient = patientID => {
    setTimeout(() => {
      this.props.deletePatient(patientID).then(this.refresh())
    }, 400);
  }

  refresh() {
    setTimeout(() => {
      this.props.index().then(this.setState({})).then(console.log(this.props))
    }, 200);
  }

  delModalOK = id => {
    this.delPatient(id);
    this.setState({ visible: false });
  }

  delModalCancel() {
    this.setState({ visible: false });
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
          title="Patients"
          subTitle="Individual"
          breadcrumb={{ routes }}
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
          <Divider orientation="left">My Patients</Divider>
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
                                <Tag color="blue">{condition}</Tag>
                              ))}
                            </p>
                            <p>
                              Clinicians:{' '}
                              {item.users.map(user => (
                                <Tag color="cyan">{user.name}</Tag>
                              ))}
                            </p>
                          </div>
                        }
                      />
                    </Link>
                    <Button
                      key={item.id + "delete"}
                      type="secondary"
                      onClick={() => this.setState({ visible: true, delid:item.id, delname:item.name })}
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
  }
}

const mapStateToProps = state => ({
  patients: Object.values(state.patients.entities),
  loading: state.patients.status.loading
});

const mapDispatchToProps = dispatch => ({
  index: () => dispatch(index()),
  deletePatient: (id) => dispatch(deletePatient(id))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Patients);

const styles = {};
