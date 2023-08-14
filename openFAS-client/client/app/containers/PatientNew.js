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
import * as patientActions from '../store/patients';
import { connect } from 'react-redux';

class PatientNew extends React.Component {
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
      this.props.createPatient(values);
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
    if (this.props.teams) {
      return (

        <>
          {button}
          <Drawer
            title="Create a new patient"
            width={600}
            onClose={this.onClose}
            visible={this.state.visible}
          >
            <Form layout="vertical" onSubmit={this.handleSubmit} hideRequiredMark>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Full Name">
                    {getFieldDecorator('name', {
                      rules: [
                        {
                          required: true,
                          message: "Please enter the patient's name"
                        }
                      ]
                    })(<Input placeholder="Please enter the patient's name" />)}
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Date Of Birth">
                    {getFieldDecorator('dateOfBirth', {
                      rules: [{ required: true, message: 'Please enter url' }]
                    })(<DatePicker style={{ width: '100%' }} />)}
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Form.Item label="Team">
                  {getFieldDecorator('team', {
                    rules: [{ required: true, message: 'Please enter url' }]
                  })(
                    <Select
                      placeholder="Team"
                      style={{ minWidth: '30%' }}
                    >
                      {Object.values(this.props.teams).map(team => (
                        <Select.Option key={team.id} value={team.id}>
                          {team.name}
                        </Select.Option>
                      ))}
                    </Select>)}
                </Form.Item>
              </Row>
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item label="Medical Conditions">
                    {getFieldDecorator('conditions', {
                      rules: [
                        {
                          required: true,
                          message: "Please enter patient's conditions"
                        }
                      ]
                    })(
                      <Select
                        mode="tags"
                        style={{ width: '100%' }}
                        placeholder="Please enter patient's conditions"
                      />
                    )}
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
                  Create Patient
                </Button>
              </div>
            </Form>
          </Drawer>
        </>)
    } else {
      return ""
    }
  }
}

const mapStateToProps = state => ({});

const mapDispatchToProps = dispatch => ({
  createPatient: data => dispatch(patientActions.create(data))
});

const PatientNewForm = Form.create()(PatientNew);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PatientNewForm);
