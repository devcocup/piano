import storage from '../util/storage';
import { WAIT_FOR_INPUT_CHANGED, INPUT_STAFFS_CHANGED } from '../constants/actionTypes';
import { MIDI_KEYBOARD_INPUT } from '../constants/reducerNames';

const stateToSave = state => {
  return {
    inputStaffs: state.inputStaffs,
    waitForInput: state.waitForInput,
  };
};

const saveFileData = state => {
  if (state.midiFileName) {
    storage.saveFileData(
      state.midiFileName,
      MIDI_KEYBOARD_INPUT,
      stateToSave(state[MIDI_KEYBOARD_INPUT]),
    );
  }
  return state;
};

export const setWaitForInput = waitForInput => (dispatch, getState) => {
  dispatch({
    type: WAIT_FOR_INPUT_CHANGED,
    payload: waitForInput,
  });

  saveFileData(getState());
};

export const setInputStaffs = inputStaffs => (dispatch, getState) => {
  dispatch({
    type: INPUT_STAFFS_CHANGED,
    payload: inputStaffs,
  });

  saveFileData(getState());
};
