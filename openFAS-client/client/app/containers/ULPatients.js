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
  Modal,
  Popover
} from 'antd';
import route from '../constants/routes';
import { connect } from 'react-redux';
import { index } from '../store/ULpatients';
import { Link } from 'react-router-dom';
import { del as deletePatient } from '../store/ULpatients';

const routes = [
  {
    path: route.ULPATIENTS,
    breadcrumbName: 'ULPatients'
  },
  {
    path: route.ULPATIENTS,
    breadcrumbName: 'All Patients'
  }
];

class ULPatients extends React.Component {
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
      this.props.index().then(this.setState({}))
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
            <Popover content={"Reload the page"} key={"ulpatientreload"}>
              <Button
                key={"ULupdate"}
                type="secondary"
                onClick={() => this.refresh()}
                style={{ float: 'right' }}
              >
                <Icon type="reload" />
              </Button>
            </Popover>]}
        />
        <div style={{ margin: 20 }}>
          <Divider orientation="left">My Patients</Divider>
          <Row gutter={16}>
            {!this.props.loading &&
              this.props.ULpatients.map(item => (
                <Col
                  key={"ULpatient col"+item.id}
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
                                <Tag color="blue" key={"condition"+condition+item.id}>{condition}</Tag>
                              ))}
                            </p>
                            <p>
                              Clinicians:{' '}
                              {item.users.map(user => (
                                <Tag color="cyan" key={"clicinans"+user.name+item.id}>{user.name}</Tag>
                              ))}
                            </p>
                          </div>
                        }
                      />
                    </Link>
                    <Popover content={"Delete " + item.name + " and all related sessions"}>
                      <Button
                        key={item.id + "delete"}
                        type="secondary"
                        onClick={() => this.setState({ visible: true, delid: item.id, delname: item.name })}
                        style={{ float: 'right', marginLeft: '.5rem' }}
                      >
                        <Icon type="delete" />
                      </Button>
                    </Popover>
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
  ULpatients: Object.values(state.ULpatients.entities),
  loading: state.ULpatients.status.loading
});

const mapDispatchToProps = dispatch => ({
  index: () => dispatch(index()),
  deletePatient: (id) => dispatch(deletePatient(id))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ULPatients);
