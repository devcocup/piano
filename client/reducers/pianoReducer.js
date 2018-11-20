import {
  LOAD_FILE_SUCCESS,
  LOAD_FILE_DATA_SUCCESS,
} from '../constants/actionTypes';

import {
  PLAYER,
  SHEET_MUSIC_OUTPUT,
} from '../constants/reducerNames';

const initialState = {};



export default (state = initialState, action) => {
  switch (action.type) {
    case LOAD_FILE_SUCCESS:
      return { 
        ...state, 
        parsedMidiFile: action.payload.parsedMidiFile,
        midiArrayBuffer: action.payload.midiArrayBuffer,
        midiFileName: action.payload.midiFileName,
      };
    case LOAD_FILE_DATA_SUCCESS:
      return { ...state, 
        [PLAYER]: action.payload.moduleData[PLAYER],
        [SHEET_MUSIC_OUTPUT]: action.payload.moduleData[SHEET_MUSIC_OUTPUT] 
      };
    
  }
  return { ...state };
};
