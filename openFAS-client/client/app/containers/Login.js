import * as React from 'react';
import {
  Form,
  Icon,
  Input,
  Button,
  Alert,
  Row,
  Col,
  Tabs,
  Carousel
} from 'antd';
import { auth, create } from '../store/user';
import { connect } from 'react-redux';
import logo from '../assets/logo.png';
import screenshot1 from '../assets/screenshot1.png';
import screenshot2 from '../assets/screenshot2.png';
import screenshot3 from '../assets/screenshot3.png';
import screenshot4 from '../assets/screenshot4.png';

const { TabPane } = Tabs;

class Login extends React.Component {
  state = {
    form: 'login'
  };

  handleSubmit = e => {
    console.log(e);
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.state.form == 'login' && this.props._auth(values);
        this.state.form == 'signup' && this.props._create(values);
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Row>
        <Col span={18} push={6} style={styles.rightContainer}>
          <Carousel autoplay>
            <div>
              <img src={screenshot1} style={{ height: '80vh' }} />
            </div>
            <div>
              <img src={screenshot2} style={{ height: '80vh' }} />
            </div>
            <div>
              <img src={screenshot3} style={{ height: '80vh' }} />
            </div>
            <div>
              <img src={screenshot4} style={{ height: '80vh' }} />
            </div>
          </Carousel>
        </Col>
        <Col span={6} pull={18} style={styles.leftContainer}>
          <img src={logo} style={styles.logo} />
          <Tabs
            defaultActiveKey="login"
            onChange={form => this.setState({ form })}
          >
            <TabPane tab="Login" key="login"></TabPane>
            <TabPane tab="Sign Up" key="signup"></TabPane>
          </Tabs>
          <Form onSubmit={this.handleSubmit}>
            <Form.Item>
              {getFieldDecorator('email', {
                rules: [{ required: true, message: 'Please input your email!' }]
              })(
                <Input
                  style={styles.inputContainer}
                  prefix={
                    <Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />
                  }
                  placeholder="Email"
                />
              )}
            </Form.Item>
            <Form.Item>
              {getFieldDecorator('password', {
                rules: [
                  { required: true, message: 'Please input your password!' }
                ]
              })(
                <Input.Password
                  style={styles.inputContainer}
                  prefix={
                    <Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />
                  }
                  type="password"
                  placeholder="Password"
                />
              )}
            </Form.Item>
            {this.state.form == 'signup' && (
              <Form.Item>
                {getFieldDecorator('name', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input enter your full name.'
                    }
                  ]
                })(
                  <Input
                    style={styles.inputContainer}
                    prefix={
                      <Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />
                    }
                    placeholder="Full Name"
                  />
                )}
              </Form.Item>
            )}
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                style={styles.authButton}
              >
                {this.state.form == 'login' && <span>Login</span>}
                {this.state.form == 'signup' && <span>Create Account</span>}
              </Button>
            </Form.Item>
            {this.props.user.status.error && (
              <Alert message="Invalid credentials." type="error" showIcon />
            )}
          </Form>
        </Col>
      </Row>
    );
  }
}

const mapStateToProps = state => ({
  user: state.user
});

const mapDispatchToProps = dispatch => ({
  _auth: values => dispatch(auth(values)),
  _create: values => dispatch(create(values))
});

const FormLogin = Form.create()(Login);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FormLogin);

const styles = {
  logo: {
    width: '100%'
  },
  rightContainer: {
    height: '100vh',
    padding: '40px'
  },
  leftContainer: {
    backgroundColor: '#FEBC59',
    height: '100vh',
    padding: '20px'
  },
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh'
  },
  inputContainer: {
    width: '100%',
    height: '3em',
    fontSize: '1em'
  },
  authButton: {
    width: '100%',
    height: '3em',
    fontSize: '1em',
    fontWeight: 'bold'
  }
};
