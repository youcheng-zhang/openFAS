import React from 'react';
import {
  Card,
  Empty,
  Row,
  Col,
  Timeline,
  Button,
  Icon,
  Statistic,
  Tabs,
  List,
  Comment,
  Tooltip,
  Input,
  Form,
  Skeleton,
  PageHeader,
  Descriptions,
  Popover
} from 'antd';
import {
  BarChartOutlined,
  StockOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined
} from '@ant-design/icons';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ToolTip,
  Legend,
  Label,
  ResponsiveContainer
} from 'recharts';
import moment from 'moment';
import { get as getSession } from '../store/ULsessions';
import { del as deleteSession } from '../store/ULsessions';
import { update as updateSession } from '../store/ULsessions';
import { get as getExercise } from '../store/ULexercises';
import { connect } from 'react-redux';
import _ from 'lodash';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Meta } = Card;
const LINE_COLORS = ['#0099ff', '#009999', '#990099', '#663300']

const sessionComparator = (a, b) =>
  new Date(a.beginTime) - new Date(b.beginTime);

class ULSessionExplorer extends React.Component {
  state = {
    ULResults: {},
    size: 'large',
    comment: ""
  };

  openSession = sessionId => {
    setTimeout(() => {
      this.props.getSession(sessionId);
    }, 200);
  };

  delSession = sessionId => {
    setTimeout(() => {
      this.props.deleteSession(sessionId).then(this.refresh.bind(this))
    }, 400);
  }

  refresh() {
    this.props.refresh();
  }

  postNote = () => {
    if (this.props.entity) {
      var newNote = {
        user: this.props.entity.user._id,
        note: this.state.comment,
        updatedAt: new Date(),
      }
      var newNotes = [
        ...this.props.entity.notes,
        newNote,]
      var apiData = {
        notes: newNotes
      }
      setTimeout(() => {
        this.props.updateSession(this.props.entity.id, apiData);
      }, 200);

    }
  }

  handleChange = e => {
    this.setState({
      comment: e.target.value,
    });
  };

  render() {
    return (
      <div style={styles.container}>
        {this.props.sessions.length !== 0 && (
          <Row>
            <Col span={17} push={7}>
              <Card style={{ marginBottom: 20 }}>
                <Skeleton loading={this.props.loading} active />
                {!this.props.loading && !_.isEmpty(this.props.entity) && (
                  <PageHeader
                    style={{ margin: 0, padding: 0 }}
                    title={moment(new Date(this.props.entity.beginTime)).format(
                      'MMMM Do, YYYY'
                    )}
                    subTitle={`ID: ${this.props.entity.id}`}
                    extra={[
                      <Popover content={"Delete session"} key={"deletepopover"+this.props.entity.id}>
                        <Button
                          key="1"
                          onClick={() => this.delSession(this.props.entity.id)}
                        >
                          <Icon type="delete" />
                        </Button>
                      </Popover>,
                      <Popover content={"Reload session"} key={"reloadepopover"+this.props.entity.id}>
                        <Button
                          key="2"
                          type="primary"
                          onClick={() => this.openSession(this.props.entity.id)}
                        >
                          <Icon type="redo" />
                        </Button>
                      </Popover>
                    ]}
                    footer={
                      <Tabs>
                        <TabPane tab="Summary" key="Summary">
                          {this.props.entity.ULResults &&
                            Object.keys(this.props.entity.ULResults).length >
                            0 ? (
                            <>
                              <Row gutter={16}>
                                <Col span={6}>
                                  <Statistic title="Score" value={this.props.entity.score} prefix={<BarChartOutlined />} />
                                </Col>
                                <Col span={6}>
                                  <Statistic title="Maximun Score" value={this.props.entity.maximunScore} />
                                </Col>
                              </Row>
                              <Row gutter={16}>
                                <Col span={6}>
                                  <Statistic title="Static Score" value={this.props.entity.staticScore} prefix={<StockOutlined />} />
                                </Col>
                                <Col span={6}>
                                  <Statistic title="Maximun Static Score" value={this.props.entity.maximunStaticScore} />
                                </Col>
                                <Col span={6}>
                                  <Statistic title="Dynamic Score" value={this.props.entity.dynamicScore} prefix={<StockOutlined />} />
                                </Col>
                                <Col span={6}>
                                  <Statistic title="Maximun Dynamic Score" value={this.props.entity.maximunDynamicScore} />
                                </Col>
                              </Row>
                            </>

                          ) : (
                            <>Results not available.</>
                          )}
                        </TabPane>
                        <TabPane tab="Details" key="Details">
                          {this.props.entity.ULResults &&
                            Object.keys(this.props.entity.ULResults).length >
                            0 ? (
                            <Tabs tabPosition="left">
                              {Object.values(this.props.entity.ULResults).map(result => (
                                <TabPane tab={result.name} key={result.name}>
                                  <Row gutter={16}>
                                    <Col span={9}>
                                      <Statistic title="Static Score" value={result.static} prefix={<PauseCircleOutlined />} />
                                    </Col>
                                    <Col span={9}>
                                      <Statistic title="Maximun Static Score" value={result.maxStatic} />
                                    </Col>
                                  </Row>
                                  <Row gutter={16}>
                                    <Col span={9}>
                                      <Statistic title="Dynamic Score" value={result.dynamic} prefix={<PlayCircleOutlined />} />
                                    </Col>
                                    <Col span={9}>
                                      <Statistic title="Maximun Dynamic Score" value={result.maxDynamic} />
                                    </Col>
                                  </Row>
                                  <Row gutter={16}>
                                    <img src={result.imageURL} />
                                  </Row>
                                  <Popover content={"Play the recording"} title="Playback">
                                    <a href={"vlc://file:///" + result.recordingURL} target="_blank">
                                      <Button key={"Playback" + result.name} type="primary" size={this.state.size} >Playback</Button>
                                    </a>
                                  </Popover>
                                </TabPane>
                              ))}
                            </Tabs>
                          ) : (
                            <>Results not available.</>
                          )}
                        </TabPane>
                      </Tabs>
                    }
                  >
                    <Descriptions size="small" column={4}>
                      <Descriptions.Item label="Start Time">
                        {moment(new Date(this.props.entity.beginTime)).format(
                          'HH:mm A'
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="End Time">
                        {moment(new Date(this.props.entity.endTime)).format(
                          'HH:mm A'
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="Duration">
                        {`${moment(new Date(this.props.entity.endTime)).diff(
                          moment(new Date(this.props.entity.beginTime)),
                          'seconds'
                        )} seconds`}
                      </Descriptions.Item>
                      <Descriptions.Item label="Administered by">
                        {this.props.entity.user.name}
                      </Descriptions.Item>
                    </Descriptions>
                  </PageHeader>
                )}
                {!this.props.loading && _.isEmpty(this.props.entity) && (
                  <Empty description="Please select a session on the left." />
                )}
              </Card>
              {/* Session Notes */}
              <Card title="Session Notes">
                {!this.props.loading ? (
                  <>
                    <List
                      locale={{
                        emptyText:
                          'There appears to be no notes added to this session.'
                      }}
                      itemLayout="horizontal"
                      dataSource={this.props.entity.notes}
                      renderItem={item => (
                        <Comment
                          // author={item.user.name}
                          avatar={<Icon type="user" />}
                          content={item.note}
                          datetime={
                            <Tooltip
                              title={moment(new Date(item.updatedAt)).format(
                                'DD/MM/YYYY HH:mm'
                              )}
                            >
                              <span>
                                {moment(new Date(item.updatedAt)).fromNow()}
                              </span>
                            </Tooltip>
                          }
                        />
                      )}
                    />
                    {!_.isEmpty(this.props.entity) && (
                      <Comment
                        avatar={<Icon type="user" />}
                        content={
                          <>
                            <Form.Item>
                              <TextArea onChange={this.handleChange} rows={4} />
                            </Form.Item>
                            <Form.Item>
                              <Button htmlType="submit" type="primary" onClick={this.postNote}>
                                Post
                              </Button>
                            </Form.Item>
                          </>
                        }
                      />
                    )}{' '}
                  </>
                ) : (
                  <Skeleton active />
                )}
              </Card>
            </Col>
            <Col
              span={7}
              pull={17}
              style={{
                paddingRight: 20,
                overflowX: 'hidden',
                overflowY: 'hidden',
                maxHeight: '100%'
              }}
            >
              <Timeline reverse>
                {this.props.sessions.sort(sessionComparator).map(session => (
                  <Timeline.Item key={session.id}>
                    <Card onClick={() => this.openSession(session.id)}>
                      <Row>
                        <Col span={18}>
                          {moment(new Date(session.beginTime)).format('MMMM Do, HH:mm')}
                          <br />
                          Administered by <a>{session.user.name}</a>
                        </Col>
                        <Col span={6} push={3}>
                          <Button
                            type={
                              !_.isEmpty(this.props.entity) &&
                                this.props.entity.id === session.id
                                ? 'primary'
                                : 'secondary'
                            }
                            onClick={() => this.openSession(session.id)}
                          >
                            <Icon
                              type={
                                !_.isEmpty(this.props.entity) &&
                                  this.props.entity.id === session.id
                                  ? 'folder-open'
                                  : 'folder'
                              }
                            />
                          </Button>
                        </Col>
                      </Row>
                    </Card>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Col>
          </Row>
        )}
        {!this.props.loading && this.props.sessions.length === 0 && (
          <Empty description="This patients doesn't appear to have any sessions." />
        )}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  entity: state.ULsessions.entity,
  exercise: state.exercises.entity
});

const mapDispatchToProps = dispatch => ({
  getSession: id => dispatch(getSession(id)),
  getExercise: id => dispatch(getExercise(id)),
  deleteSession: id => dispatch(deleteSession(id)),
  updateSession: (id, data) => dispatch(updateSession(id, data))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ULSessionExplorer);

const styles = {
  container: {
    margin: 20
  },
  image: {
    width: 200,
    height: 200,
  }
};
