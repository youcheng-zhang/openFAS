import axiosInstance from '../utils/axios';
import { entities } from '../constants/store';

const entity = entities.ULPATIENTS;

// ------------------- ACTION TYPES ------------------- //

export const STATUS_LOADING = `${entity}/STATUS_LOADING`;
export const STATUS_SUCCESS = `${entity}/STATUS_SUCCESS`;
export const STATUS_FAILURE = `${entity}/STATUS_FAILURE`;
export const INDEX = `${entity}/INDEX`;
export const GET = `${entity}/GET`;
export const CREATE = `${entity}/CREATE`;
export const UPDATE = `${entity}/UPDATE`;
export const DELETE = `${entity}/DELETE`;
export const RESET = `${entity}/RESET`;

// ------------------- ACTION CREATORS ------------------- //

export const index = () => dispatch => {
  dispatch({ type: STATUS_LOADING });
  return axiosInstance
    .get(entity)
    .then(response => {
      dispatch({ type: STATUS_SUCCESS });
      dispatch({ type: INDEX, payload: response.data });
    })
    .catch(error => {
      dispatch({ type: STATUS_FAILURE });
    });
};

export const indexTeamULPatient = id => dispatch => {
  dispatch({ type: STATUS_LOADING });
  return axiosInstance
    .get(`${entity}/team/${id}`)
    .then(response => {
      dispatch({ type: STATUS_SUCCESS });
      dispatch({ type: INDEX, payload: response.data });
    })
    .catch(error => {
      dispatch({ type: STATUS_FAILURE });
    });
};

export const get = id => dispatch => {
  dispatch({ type: STATUS_LOADING });
  return axiosInstance
    .get(`${entity}/${id}`)
    .then(response => {
      dispatch({ type: STATUS_SUCCESS });
      dispatch({ type: GET, payload: response.data });
    })
    .catch(error => {
      dispatch({ type: STATUS_FAILURE });
    });
};

export const create = data => dispatch => {
  dispatch({ type: STATUS_LOADING });
  return axiosInstance
    .post(entity, data)
    .then(response => {
      dispatch({ type: STATUS_SUCCESS });
      dispatch({
        type: CREATE,
        payload: response.data
      });
    })
    .catch(error => {
      dispatch({ type: STATUS_FAILURE });
    });
};

export const update = (id, data) => dispatch => {
  dispatch({ type: STATUS_LOADING });
  return axiosInstance
    .put(`${entity}/${id}`, data)
    .then(response => {
      dispatch({ type: STATUS_SUCCESS });
      dispatch({
        type: UPDATE,
        payload: response.data
      });
    })
    .catch(error => {
      dispatch({ type: STATUS_FAILURE });
    });
};

export const del = (id, data) => dispatch => {
  dispatch({ type: STATUS_LOADING });
  return axiosInstance
    .delete(`${entity}/${id}`, data)
    .then(response => {
      dispatch({ type: STATUS_SUCCESS });
      dispatch({
        type: DELETE,
        payload: response.data
      });
    })
    .catch(error => {
      dispatch({ type: STATUS_FAILURE });
    });
};

// ------------------- REDUCER ------------------- //

const initialState = {
  entities: {},
  entity: {},
  status: {
    loading: false,
    success: false,
    error: false
  }
};

const reducedState = type =>
  ({
    [STATUS_LOADING]: (state, payload) => ({
      ...state,
      status: {
        loading: true,
        success: false,
        error: false
      }
    }),
    [STATUS_SUCCESS]: (state, payload) => ({
      ...state,
      status: {
        loading: false,
        success: true,
        error: false
      }
    }),
    [STATUS_FAILURE]: (state, payload) => ({
      ...state,
      status: {
        loading: false,
        success: false,
        error: true
      }
    }),
    [INDEX]: (state, payload) => ({
      ...state,
      entities: payload.reduce((obj, item) => {
        obj[item.id] = item;
        return obj;
      }, {})
    }),
    [GET]: (state, payload) => ({
      ...state,
      entities: {
        ...state.entities,
        [payload.id]: payload
      },
      entity: payload
    }),
    [CREATE]: (state, payload) => ({
      ...state,
      entities: {
        ...state.entities,
        [payload.id]: payload
      },
      entity: payload,
    }),
    [UPDATE]: (state, payload) => ({
      ...state,
      entities: {
        ...state.entities,
        [payload.id]: payload
      },
      entity: payload
    }),
    [DELETE]: (state, payload) => ({
      ...state,
      entities: {
        ...state.entities,
        [payload.id]: payload
      },
      entity: payload
    }),
    [RESET]: (state, payload) => initialState,
  }[type]);

const reducer = (state = initialState, { type, payload }) =>
  reducedState(type) ? reducedState(type)(state, payload) : state;

export default reducer;
