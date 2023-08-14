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
import { index } from '../store/teams';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { del as deleteTeam } from '../store/teams';

const routes = [
  {
    path: route.TEAMS,
    breadcrumbName: 'Teams'
  },
  {
    path: route.TEAMS,
    breadcrumbName: 'All Teams'
  }
];

class Teams extends React.Component {
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

  delTeam = teamID => {
    setTimeout(() => {
      this.props.deleteTeam(teamID).then(this.refresh())
    }, 400);
  }

  refresh() {
    setTimeout(() => {
      this.props.index().then(this.setState({}))
    }, 200);
  }

  delModalOK = id => {
    this.delTeam(id);
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
          <p>Are you sure to delete the team <b>{this.state.delname}</b>?</p>
        </Modal>
        <PageHeader
          style={{ background: 'white' }}
          title="My Teams"
          subTitle="You're currently apart of these teams."
          breadcrumb={{ routes }}
          extra={[
            <Popover content={"Reload the page"} key={"Teamreload"}>
              <Button
                key={"teamupdate"}
                type="secondary"
                onClick={() => this.refresh()}
                style={{ float: 'right' }}
              >
                <Icon type="reload" />
              </Button>
            </Popover>]}
        />
        <div style={{ margin: 20 }}>
          <Row gutter={16}>
            {!this.props.loading &&
              this.props.ULpatients.map(item => (
                <Col
                  key={"teams col"+item.id}
                  xs={{ span: 100 }}
                  lg={{ span: 12 }}
                  style={{ marginBottom: 20 }}
                >
                  <Card>
                    <Link to={`/teams/${item.id}`}>
                      <Card.Meta
                        avatar={<Avatar icon="deployment-unit" />}
                        title={item.name}
                        description={
                          <div>
                          </div>
                        }
                      />
                    </Link>
                    <Popover content={"Delete " + item.name} key={"teamdeletepopover"}>
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
  ULpatients: Object.values(state.teams.entities),
  loading: state.teams.status.loading
});

const mapDispatchToProps = dispatch => ({
  index: () => dispatch(index()),
  deleteTeam: (id) => dispatch(deleteTeam(id))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Teams);
