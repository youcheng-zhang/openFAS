import React from 'react';
import { Switch, Route } from 'react-router';
import routes from './constants/routes';
import App from './containers/App';
import Sessions from './containers/Sessions';
import ULSessions from './containers/ULSessions';
import SessionNew from './containers/SessionNew';
import ULSessionNew from './containers/ULSessionNew';
import Patient from './containers/Patient';
import ULPatient from './containers/ULPatient';
import Patients from './containers/Patients';
import ULPatients from './containers/ULPatients';
import Team from './containers/Team';
import Teams from './containers/Teams';
import Preferences from './containers/Preferences';

export default () => (
  <App>
    <Switch>
      <Route path={routes.SESSION_NEW} component={SessionNew} />
      <Route path={routes.ULSESSION_NEW} component={ULSessionNew} />
      <Route path={routes.SESSIONS} component={Sessions} />
      <Route path={routes.ULSESSIONS} component={ULSessions} />
      <Route path={routes.PATIENT} component={Patient} />
      <Route path={routes.ULPATIENT} component={ULPatient} />
      <Route path={routes.PATIENTS} component={Patients} />
      <Route path={routes.ULPATIENTS} component={ULPatients} />
      <Route path={routes.TEAM} component={Team} />
      <Route path={routes.TEAMS} component={Teams} />
      <Route path={routes.PREFERENCES} component={Preferences} />
    </Switch>
  </App>
);
