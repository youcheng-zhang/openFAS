import React from 'react';
import { PageHeader, Skeleton, Tag, Button, Icon } from 'antd';
import { connect } from 'react-redux';
import { get } from '../store/patients';
import { indexPatientSessions } from '../store/sessions';
import route from '../constants/routes';
import moment from 'moment';
import _ from 'lodash';
import SessionExplorer from '../components/SessionExplorer';
import { index as indexSession } from '../store/sessions';

const routes = patientID => [
  {
    path: route.PATIENTS,
    breadcrumbName: 'Patients'
  },
  {
    path: `/patients/${patientID}`,
    breadcrumbName: patientID
  }
];

class PatientView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      patientId: null,
      patient: null,
      sessions: null,
      session: null
    };
  }

  componentDidMount() {
    this.updatePatient(this.props);
  }

  componentWillReceiveProps(newProps) {
    if (this.props.location.pathname !== newProps.location.pathname) {
      this.updatePatient(newProps);
    }
  }

  updatePatient = props => {
    const path = props.location.pathname;
    const patientId = path.split('/')[2];
    this.setState({ patientId });
    this.props.get(patientId);
    this.props.indexPatientSessions(patientId);
  };

  refreshSession() {
    this.props.indexSession().then(this.setState({ }))
  }

  render() {
    return (
      <div>
        {/* Loading Patient */}
        {this.props.loadingPatient && (
          <PageHeader style={{ background: 'white' }}>
            <Skeleton active />
          </PageHeader>
        )}
        {/* Patient Details */}
        {!this.props.loadingPatient && !_.isEmpty(this.props.patient) && (
          <PageHeader
            style={{ background: 'white' }}
            title={this.props.patient.name}
            subTitle={
              <div>
                DOB:{' '}
                <Tag color="blue" key="details-dob">
                  {moment(new Date(this.props.patient.dateOfBirth)).format(
                    'DD/MM/YYYY'
                  )}
                </Tag>
                Updated:{' '}
                <Tag color="blue" key="details-updated">
                  {moment(new Date(this.props.patient.updatedAt)).format(
                    'DD/MM/YYYY HH:mm'
                  )}
                </Tag>
                Created:{' '}
                <Tag color="blue" key="details-created">
                  {moment(new Date(this.props.patient.createdAt)).format(
                    'DD/MM/YYYY HH:mm'
                  )}
                </Tag>
                Clinicians:{' '}
                {this.props.patient.users.map(user => (
                  <Tag key={`${this.props.patient.id}/${user.id}`} color="cyan">
                    {user.name}
                  </Tag>
                ))}
              </div>
            }
            breadcrumb={{ routes: routes(this.state.patientId) }}
            extra={[
              <Button type="secondary" onClick={() => {}} key={"patientedit"}>
                <Icon type="edit" />
              </Button>,
              <Button
                type="secondary"
                onClick={() => this.updatePatient(this.props)}
                key={"patientreload"}
              >
                <Icon type="reload" />
              </Button>
            ]}
          />
        )}
        {/* Patient Sessions */}
        <SessionExplorer
          loading={this.props.loadingSessions}
          sessions={Object.values(this.props.sessions)}
          refresh={this.refreshSession.bind(this)}
        />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  patient: state.patients.entity,
  sessions: state.sessions.entities,
  loadingPatient: state.patients.status.loading,
  loadingSessions: state.sessions.status.loading
});

const mapDispatchToProps = dispatch => ({
  get: id => dispatch(get(id)),
  indexPatientSessions: id => dispatch(indexPatientSessions(id)),
  indexSession: id => dispatch(indexSession(id))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PatientView);

const styles = {
  container: {
    margin: 20
  }
};
