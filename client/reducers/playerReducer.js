import storage from '../util/storage';

import { PLAY, PAUSE, SET_TEMPO } from '../constants/actionTypes';

const initialState = {
  isPlaying: false,
  tempo: 100,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case PLAY:
      return { ...state, isPlaying: true };
    case PAUSE:
      return { ...state, isPlaying: false };
    case SET_TEMPO:
      return { ...state, tempo: action.payload };
  }
  return state;
};

export default reducer;
