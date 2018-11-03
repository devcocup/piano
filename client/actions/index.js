import { 
  PLAY,
  PAUSE,
  SET_TEMPO,
  LOAD_FILE,
} from '../constants/actionTypes';

export const play = () => ({
  type: PLAY,
});

export const pause = () => ({
  type: PAUSE,
});

export const setTempo = tempo => ({
  type: SET_TEMPO,
  payload: tempo,
});

export const loadFile = file => ({
  type: LOAD_FILE,
  payload: file,
});