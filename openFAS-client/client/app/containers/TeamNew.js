import React from 'react';
import {
  Drawer,
  Form,
  Col,
  Row,
  Input,
  Button,
  DatePicker,
  message,
  Select
} from 'antd';
import * as teamActions from '../store/teams';
import { connect } from 'react-redux';

class teamNew extends React.Component {
  state = { visible: false };

  showDrawer = () => {
    this.setState({
      visible: true
    });
  };

  onClose = () => {
    this.setState({
      visible: false
    });
  };

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err) return;
      this.props.createteam(values);
      message.success(values.name + ' was added');
      this.onClose();
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const button = React.Children.map(this.props.children, (child, index) =>
      React.cloneElement(child, {
        index,
        onClick: this.showDrawer
      })
    );
    return (
      <>
        {button}
        <Drawer
          title="Create a new team"
          width={600}
          onClose={this.onClose}
          visible={this.state.visible}
        >
          <Form layout="vertical" onSubmit={this.handleSubmit} hideRequiredMark>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Team Name">
                  {getFieldDecorator('name', {
                    rules: [
                      {
                        required: true,
                        message: "Please enter the team's name"
                      }
                    ]
                  })(<Input placeholder="Please enter the team's name" />)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item label="Description">
                  {getFieldDecorator('description', {
                    rules: [
                      {
                        required: true,
                        message: 'Please enter a description'
                      }
                    ]
                  })(
                    <Input.TextArea
                      rows={4}
                      placeholder="Please enter a description"
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <div
              style={{
                position: 'absolute',
                left: 0,
                bottom: 0,
                width: '100%',
                borderTop: '1px solid #e9e9e9',
                padding: '10px 16px',
                background: '#fff',
                textAlign: 'right'
              }}
            >
              <Button onClick={this.onClose} style={{ marginRight: 8 }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Create team
              </Button>
            </div>
          </Form>
        </Drawer>
      </>
    );
  }
}

const mapStateToProps = state => ({});

const mapDispatchToProps = dispatch => ({
  createteam: data => dispatch(teamActions.create(data))
});

const teamNewForm = Form.create()(teamNew);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(teamNewForm);
