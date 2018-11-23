import {
  LOAD_FILE_SUCCESS,
  LOAD_FILE_DATA_SUCCESS,
} from '../constants/actionTypes';

import * as reducerNames from '../constants/reducerNames';

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
      return Object.values(reducerNames).reduce(
        (acc, val) => {
          acc[val] = action.payload.moduleData[val];
          return acc;
        },
        { ...state },
      );
  }
  return { ...state };
};
