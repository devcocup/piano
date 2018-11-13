import storage from '../util/storage';

import {
  PLAY,
  PAUSE,
  SET_TEMPO,
  LOAD_FILE_SUCCESS,
} from '../constants/actionTypes';

const initialState = {
  isPlaying: false,
  tempo: 100,
  file: null,
};

const playerStateToSave = state => ({
  tempo: state.tempo,
});

const saveFileData = state => {
  if (state.midiFileName) {
    storage.saveFileData(state.midiFileName, playerStateToSave(state));
  }
  return state;
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case PLAY:
      return { ...state, isPlaying: true };
    case PAUSE:
      return { ...state, isPlaying: false };
    case SET_TEMPO:
      return saveFileData({ ...state, tempo: action.payload });
    case LOAD_FILE_SUCCESS:
      return { ...state, ...action.payload };
  }
  return state;
};

export default reducer;
