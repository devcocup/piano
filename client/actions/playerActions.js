import storage from '../util/storage';

import {
  PLAYER,
} from '../constants/reducerNames';

import { 
  PLAY,
  PAUSE,
  SET_TEMPO,
} from '../constants/actionTypes';

export const play = () => ({
  type: PLAY,
});

export const pause = () => ({
  type: PAUSE,
});

export const setTempo = tempo => (dispatch, getState) => {
  dispatch({
    type: SET_TEMPO,
    payload: tempo,  
  });

  saveFileData(getState());
};

const playerStateToSave = state => ({
  tempo: state.tempo,
});

const saveFileData = state => {
  if (state.midiFileName) {
    storage.saveFileData(state.midiFileName, PLAYER, playerStateToSave(state[PLAYER]));
  }
  return state;
};

