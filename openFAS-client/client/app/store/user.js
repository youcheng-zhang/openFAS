import axios from 'axios';
import { entities } from '../constants/store';

const entity = entities.USERS;

export const CREATE = `${entity}/CREATE`;
export const STATUS_SUCCESS = `${entity}/STATUS_SUCCESS`;
export const STATUS_FAILURE = `${entity}/STATUS_FAILURE`;
export const LOGIN = `${entity}/LOGIN`;
export const RESET = `${entity}/RESET`;

export const auth = loginDetails => dispatch => {
  dispatch({ type: LOGIN });
  return axios
    .post(`${process.env.API_URI}/auth`, loginDetails)
    .then(response => {
      dispatch({
        type: STATUS_SUCCESS,
        payload: response.data
      });
      localStorage.setItem('token', response.data.token);
    })
    .catch(error => {
      dispatch({ type: STATUS_FAILURE });
    });
};


export const create = payload => dispatch => {
  dispatch({ type: CREATE });
  return axios
    .post(`${process.env.API_URI}/${entity}`, payload)
    .then(response => {
      dispatch({
        type: STATUS_SUCCESS,
        payload: response.data
      });
      localStorage.setItem('token', response.data.token);
    })
    .catch(error => {
      dispatch({ type: STATUS_FAILURE });
    });
};

// ------------------- REDUCER ------------------- //

const initialState = {
  status: {
    loading: false,
    success: false,
    error: false
  }
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN: {
      return {
        ...state,
        status: {
          loading: true
        }
      };
    }
    case CREATE: {
      return {
        ...state,
        status: {
          loading: true
        }
      };
    }
    case STATUS_FAILURE: {
      return {
        ...state,
        status: {
          loading: false,
          success: false,
          error: true
        }
      };
    }
    case STATUS_SUCCESS: {
      return {
        ...state,
        ...action.payload,
        status: {
          loading: false,
          success: true,
          error: false
        }
      };
    }
    default:
      return state;
  }
};

export default reducer;
