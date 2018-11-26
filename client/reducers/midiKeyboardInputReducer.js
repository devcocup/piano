import {
  WAIT_FOR_INPUT_CHANGED,
  INPUT_STAFFS_CHANGED,
  SET_MIDI_KEYBOARD_PORT_ID,
  LOAD_FILE_SUCCESS,
} from '../constants/actionTypes';

import { MIDI_KEYBOARD_INPUT } from '../constants/reducerNames';

const initialState = {
  inputStaffs: 1 + 2,
  waitForInput: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case WAIT_FOR_INPUT_CHANGED:
      return { ...state, waitForInput: action.payload };
    case INPUT_STAFFS_CHANGED:
      return { ...state, inputStaffs: action.payload };
    case SET_MIDI_KEYBOARD_PORT_ID:
      return { ...state, portId: action.payload };
    case LOAD_FILE_SUCCESS:
      return {
        ...state,
        ...(action.payload.moduleData &&
          action.payload.moduleData[MIDI_KEYBOARD_INPUT]),
      };
  }
  return state;
};
