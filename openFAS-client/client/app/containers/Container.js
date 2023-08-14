// @flow
import * as React from 'react';
import { Layout, Menu, Icon } from 'antd';
import routes from '../constants/routes';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { index as patientsIndex } from '../store/patients';
import { index as ULpatientsIndex } from '../store/ULpatients';
import { index as teamsIndex } from '../store/teams';
import PatientNew from './PatientNew';
import ULPatientNew from './ULPatientNew';
import TeamNew from './TeamNew';
import { Layouts } from '../constants/app';
import { truncate } from '../utils/styler';
import * as appActions from '../store/app';

import '../styles/App.css';

const { Content, Sider } = Layout;
const { SubMenu } = Menu;

type Props = {
  children: React.Node
};

class Container extends React.Component<Props> {
  props: Props;
  state = {
    collapsed: false,
    activeMenuItem: routes.ULSESSIONS
  };

  componentDidMount() {
    this.props.patientsIndex();
    this.props.ULpatientsIndex();
    this.props.teamsIndex();
  }

  componentWillUpdate(newProps) {
    if (this.state.activeMenuItem !== newProps.location) {
      this.setState({
        activeMenuItem: newProps.location
      });
    }
  }

  onCollapse = () =>
    this.props.app.layout === Layouts.COLLAPSED
      ? this.props.toggleLayoutDefault()
      : this.props.toggleLayoutCollapsed();

  render() {
    const { children } = this.props;
    return (
      <Layout style={{ minHeight: '100vh' }}>
        {this.props.app.layout !== Layouts.FULL_SCREEN &&
          <Sider
            collapsible
            collapsed={this.props.app.layout === Layouts.COLLAPSED}
            defaultCollapsed={this.props.app.layout === Layouts.COLLAPSED}
            onCollapse={this.onCollapse}
            theme="light"
          >
            <div className="logo" />
            <Menu
              theme="light"
              selectedKeys={[this.state.activeMenuItem]}
              defaultOpenKeys={[
                routes.SESSIONS,
                routes.ULSESSIONS,
                routes.PATIENTS,
                routes.ULPATIENTS,
                routes.SETTINGS
              ]}
              mode="inline"
            >
              <SubMenu
                key={"FANALYSIS"}
                title={
                  <span>
                    <Icon type="camera" />
                    <span>Facial Analysis</span>
                  </span>
                }
              >
                <SubMenu
                  key={routes.SESSIONS}
                  title={
                    <span>
                      <Icon type="solution" />
                      <span>Sessions</span>
                    </span>
                  }
                >
                  <Menu.Item key={routes.SESSIONS}>
                    <Link className="nav-text" to={routes.SESSIONS}>
                      <Icon type="profile" />
                      <span>My Sessions</span>
                    </Link>
                  </Menu.Item>
                  <Menu.Item key={routes.SESSION_NEW}>
                    <Link className="nav-text" to={routes.SESSION_NEW}>
                      <Icon type="plus" />
                      <span>New Session</span>
                    </Link>
                  </Menu.Item>
                </SubMenu>
                <SubMenu
                  key={routes.PATIENTS}
                  title={
                    <span>
                      <Icon type="team" />
                      <span>Patients</span>
                    </span>
                  }
                >
                  {this.props.patients.map(patient => (
                    <Menu.Item key={`/patients/${patient.id}`}>
                      <Link className="nav-text" to={`/patients/${patient.id}`} style={{ textOverflow: 'ellipsis' }}>
                        <Icon type="user" />
                        {truncate(patient.name, 12)}
                      </Link>
                    </Menu.Item>
                  ))}
                  <Menu.Item key={routes.PATIENTS}>
                    <Link className="nav-text" to={routes.PATIENTS}>
                      <Icon type="ellipsis" />
                      View All
                    </Link>
                  </Menu.Item>
                  <Menu.Item>
                    <PatientNew teams={this.props.teams}>
                      <a>
                        <Icon type="plus" />
                        New Patient
                      </a>
                    </PatientNew>
                  </Menu.Item>
                </SubMenu>
              </SubMenu>
              <SubMenu
                key={"ULANALYSIS"}
                title={
                  <span>
                    <Icon type="video-camera" />
                    <span>Upper Limb Analysis</span>
                  </span>
                }
              >
                <SubMenu
                  key={routes.ULSESSIONS}
                  title={
                    <span>
                      <Icon type="solution" />
                      <span>Sessions</span>
                    </span>
                  }
                >
                  <Menu.Item key={routes.ULSESSIONS}>
                    <Link className="nav-text" to={routes.ULSESSIONS}>
                      <Icon type="profile" />
                      <span>My Sessions</span>
                    </Link>
                  </Menu.Item>
                  <Menu.Item key={routes.ULSESSION_NEW}>
                    <Link className="nav-text" to={routes.ULSESSION_NEW}>
                      <Icon type="plus" />
                      <span>New Session</span>
                    </Link>
                  </Menu.Item>
                </SubMenu>
                <SubMenu
                  key={routes.ULPATIENTS}
                  title={
                    <span>
                      <Icon type="team" />
                      <span>Patients</span>
                    </span>
                  }
                >
                  {this.props.ULpatients.map(ULpatient => (
                    <Menu.Item key={`/ULpatients/${ULpatient.id}`}>
                      <Link className="nav-text" to={`/ULpatients/${ULpatient.id}`} style={{ textOverflow: 'ellipsis' }}>
                        <Icon type="user" />
                        {truncate(ULpatient.name, 12)}
                      </Link>
                    </Menu.Item>
                  ))}
                  <Menu.Item key={routes.ULPATIENTS}>
                    <Link className="nav-text" to={routes.ULPATIENTS}>
                      <Icon type="ellipsis" />
                      View All
                    </Link>
                  </Menu.Item>
                  <Menu.Item>
                    <ULPatientNew teams={this.props.teams}>
                      <a>
                        <Icon type="plus" />
                        New Patient
                      </a>
                    </ULPatientNew>
                  </Menu.Item>
                </SubMenu>
              </SubMenu>
              <SubMenu
                key={routes.TEAMS}
                title={
                  <span>
                    <Icon type="cluster" />
                    <span>Teams</span>
                  </span>
                }
              >
                {this.props.teams.map(team => (
                  <Menu.Item key={`/teams/${team.id}`}>
                    <Link className="nav-text" to={`/teams/${team.id}`} style={{ textOverflow: 'ellipsis' }}>
                      <Icon type="deployment-unit" />
                      {truncate(team.name, 12)}
                    </Link>
                  </Menu.Item>
                ))}
                <Menu.Item key={routes.TEAMS}>
                  <Link className="nav-text" to={routes.TEAMS}>
                    <Icon type="ellipsis" />
                    View All
                  </Link>
                </Menu.Item>
                <Menu.Item>
                  <TeamNew>
                    <a>
                      <Icon type="plus" />
                      New Team
                    </a>
                  </TeamNew>
                </Menu.Item>
              </SubMenu>
              <Menu.Item key={routes.SETTINGS}>
                <Link className="nav-text" to={routes.SETTINGS}>
                  <Icon type="setting" />
                  <span>Preferences</span>
                </Link>
              </Menu.Item>
              <Menu.Item key={"logout"}>
                <Link className="nav-text" onClick={() => window.location.reload(false)} to={""}>
                  <Icon type="logout" />
                  <span>Log out</span>
                </Link>
              </Menu.Item>
            </Menu>
          </Sider>
        }
        <Layout>
          <Content>{children}</Content>
        </Layout>
      </Layout>
    );
  }
}

const patientsComparator = (a, b) => {
  return new Date(b.updatedAt) - new Date(a.updatedAt);
};

const mapStateToProps = state => {
  return {
    patients: Object.values(state.patients.entities)
      .sort(patientsComparator)
      .slice(0, 4),
    ULpatients: Object.values(state.ULpatients.entities)
      .sort(patientsComparator)
      .slice(0, 4),
    teams: Object.values(state.teams.entities)
      .slice(0, 4),
    location: state.router.location.pathname,
    app: state.app
  }
};

const mapDispatchToProps = dispatch => ({
  patientsIndex: () => dispatch(patientsIndex()),
  ULpatientsIndex: () => dispatch(ULpatientsIndex()),
  teamsIndex: () => dispatch(teamsIndex()),
  toggleLayoutDefault: () => dispatch(appActions.toggleLayoutDefault()),
  toggleLayoutCollapsed: () => dispatch(appActions.toggleLayoutCollapsed()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Container);
