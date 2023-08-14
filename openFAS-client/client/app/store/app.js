import { Layouts } from '../constants/app';

// ------------------- ACTION TYPES ------------------- //

export const TOGGLE_LAYOUT_DEFAULT = 'app/TOGGLE_LAYOUT_DEFAULT';
export const TOGGLE_LAYOUT_COLLAPSED = 'app/TOGGLE_LAYOUT_COLLAPSED';
export const TOGGLE_LAYOUT_FULL_SCREEN = 'app/TOGGLE_LAYOUT_FULL_SCREEN';

// ------------------- ACTION CREATORS ------------------- //

export const toggleLayoutDefault = () => dispatch =>
  dispatch({ type: TOGGLE_LAYOUT_DEFAULT });

export const toggleLayoutCollapsed = () => dispatch =>
  dispatch({ type: TOGGLE_LAYOUT_COLLAPSED });

export const toggleLayoutFullScreen = () => dispatch =>
  dispatch({ type: TOGGLE_LAYOUT_FULL_SCREEN });

// ------------------- REDUCER ------------------- //

const initialState = {
  layout: Layouts.DEFAULT
};

const reducedState = type => ({
  [TOGGLE_LAYOUT_DEFAULT]: (state, payload) => ({
    ...state,
    layout: Layouts.DEFAULT
  }),
  [TOGGLE_LAYOUT_COLLAPSED]: (state, payload) => ({
    ...state,
    layout: Layouts.COLLAPSED
  }),
  [TOGGLE_LAYOUT_FULL_SCREEN]: (state, payload) => ({
    ...state,
    layout: Layouts.FULL_SCREEN
  })
}[type]);

const reducer = (state = initialState, { type, payload }) =>
  reducedState(type) ? reducedState(type)(state, payload) : state;

export default reducer;
