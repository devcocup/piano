import {
  WAIT_FOR_INPUT_CHANGED,
  INPUT_STAFFS_CHANGED,
  SET_MIDI_KEYBOARD_PORT_ID,
} from '../constants/actionTypes';

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
  }
  return state;
};
