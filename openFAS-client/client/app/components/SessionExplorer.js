import React from 'react';
import {
  Card,
  Empty,
  Row,
  Col,
  Timeline,
  Button,
  Icon,
  Tabs,
  List,
  Comment,
  Tooltip,
  Input,
  Form,
  Skeleton,
  PageHeader,
  Descriptions
} from 'antd';
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
import { del as deleteSession } from '../store/sessions';
import { get as getSession } from '../store/sessions';
import { get as getExercise } from '../store/exercises';
import { connect } from 'react-redux';
import _ from 'lodash';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Meta } = Card;
const LINE_COLORS = ['#0099ff', '#009999', '#990099', '#663300']

const sessionComparator = (a, b) =>
  new Date(a.beginTime) - new Date(b.beginTime);

class SessionExplorer extends React.Component {
  state = {
    movements: {}
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
                      <Button key="1"
                        onClick={() => this.delSession(this.props.entity.id)}
                      >
                        <Icon type="delete" />
                      </Button>,
                      <Button
                        key="2"
                        type="primary"
                        onClick={() => this.openSession(this.props.entity.id)}
                      >
                        <Icon type="redo" />
                      </Button>
                    ]}
                    footer={
                      <Tabs>
                        <TabPane tab="Dynamic Analysis" key="dynamic">
                          {this.props.entity.dynamicResults &&
                            Object.keys(this.props.entity.dynamicResults).length >
                            0 ? (
                            // Get exercises
                            <Tabs>
                              {Object.keys(
                                this.props.entity.dynamicResults
                              ).map(movementId => (
                                <TabPane
                                  tab={
                                    this.state.movements[movementId] ? (
                                      <Card
                                        style={{ width: '20vw' }}
                                        cover={
                                          <video
                                            src={`${process.env.ANALYSER_URI}/resources/${this.props.entity.id}/${movementId}/rgb.mp4`}
                                            type="video/mp4"
                                            muted
                                            controls
                                          />
                                        }
                                      >
                                        <Meta
                                          title={
                                            this.state.movements[movementId]
                                              .name
                                          }
                                          description={`Total: ${this.state.movements[movementId].duration}, Maximal: ${this.state.movements[movementId].maximalDuration}`}
                                        />
                                      </Card>
                                    ) : (
                                      'Loading'
                                    )
                                  }
                                  key={movementId}
                                >
                                  <p></p>
                                  <Tabs tabPosition="left">
                                    {Object.values(
                                      this.props.entity.dynamicResults[
                                      movementId
                                      ]
                                    ).map(result => (
                                      <TabPane
                                        tab={result.name}
                                        key={result.name}
                                      >
                                        <ResponsiveContainer
                                          width="100%"
                                          height={300}
                                        >
                                          <LineChart
                                            data={result.data}
                                            margin={{
                                              top: 5,
                                              right: 30,
                                              left: 20,
                                              bottom: 5
                                            }}
                                          >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <Legend
                                              verticalAlign="top"
                                              align="right"
                                              height={36}
                                            />
                                            <XAxis dataKey="time">
                                              <Label
                                                value={result.xAxisLabel}
                                                offset={-10}
                                                position="bottom"
                                              />
                                            </XAxis>
                                            <YAxis
                                              label={{
                                                value: result.yAxisLabel,
                                                angle: -90,
                                                position: 'left'
                                              }}
                                            />
                                            <ToolTip />
                                            {result.lines.map((line, index) => (
                                              <Line
                                                key={line}
                                                type="monotone"
                                                dataKey={line}
                                                stroke={LINE_COLORS[index]}
                                                dot={false}
                                              />
                                            ))}
                                          </LineChart>
                                        </ResponsiveContainer>
                                      </TabPane>
                                    ))}
                                  </Tabs>
                                </TabPane>
                              ))}
                            </Tabs>
                          ) : (
                            <>Dynamic results not available.</>
                          )}
                        </TabPane>
                        <TabPane tab="Static Analysis" key="static">
                          <img
                            src={`${process.env.ANALYSER_URI}/resources/${this.props.entity.id}/static.png`}
                          />
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
                          author={item.user.name}
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
                              <TextArea rows={4} />
                            </Form.Item>
                            <Form.Item>
                              <Button htmlType="submit" type="primary">
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
  entity: state.sessions.entity,
  exercise: state.exercises.entity
});

const mapDispatchToProps = dispatch => ({
  getSession: id => dispatch(getSession(id)),
  getExercise: id => dispatch(getExercise(id)),
  deleteSession: id => dispatch(deleteSession(id))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SessionExplorer);

const styles = {
  container: {
    margin: 20
  }
};
