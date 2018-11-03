import {
  PLAY,
  PAUSE,
  SET_TEMPO,
  LOAD_FILE,
} from '../constants/actionTypes';

const initialState = {
  isPlaying: false,
  tempo: 100,
  file: null,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case PLAY:
      return { ...state, isPlaying: true };
    case PAUSE:
      return { ...state, isPlaying: false };
    case SET_TEMPO:
      return { ...state, tempo: action.payload };
    case LOAD_FILE:
      return { ...state, file: action.payload };
  }
  return state;
};

export default reducer;