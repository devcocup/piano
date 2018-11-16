import playerReducer from './playerReducer';
import sheetMusicOutputReducer from './sheetMusicOutputReducer';
import { PLAYER, SHEET_MUSIC_OUTPUT } from '../constants/reducerNames';

import {
  LOAD_FILE_SUCCESS,
  LOAD_FILE_DATA_SUCCESS,
} from '../constants/actionTypes';

const initialState = {};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_FILE_SUCCESS:
      return { ...state, ...action.payload };
    case LOAD_FILE_DATA_SUCCESS:
      return { ...state, ...action.payload }; 
  }
  return {...state};
};

const combineReducers = reducers => (state = {}, action) => {
  const rootState = reducer(state, action);
  return Object.keys(reducers).reduce((nextState, key) => {
    nextState[key] = reducers[key](rootState[key], action);
    return nextState;
  }, rootState);
};

export default combineReducers({
  [PLAYER]: playerReducer,
  [SHEET_MUSIC_OUTPUT]: sheetMusicOutputReducer,
});
