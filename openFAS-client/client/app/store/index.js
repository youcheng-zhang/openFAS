// @flow
import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import app from './app';
import user from './user';
import patients from './patients';
import ULpatients from './ULpatients';
import sessions from './sessions';
import ULsessions from './ULsessions';
import exercises from './exercises';
import ULexercises from './ULexercises';
import teams from './teams';

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    app,
    user,
    patients,
    ULpatients,
    sessions,
    ULsessions,
    exercises,
    ULexercises,
    teams,
  });
}
