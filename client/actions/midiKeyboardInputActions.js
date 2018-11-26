import storage from '../util/storage';
import {
  WAIT_FOR_INPUT_CHANGED,
  INPUT_STAFFS_CHANGED,
  SET_MIDI_KEYBOARD_PORT_ID,
} from '../constants/actionTypes';
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

const globalStateToSave = state => ({
  portId: state[MIDI_KEYBOARD_INPUT].portId,
});

const saveGlobalData = state => {
  storage.saveGlobalData(MIDI_KEYBOARD_INPUT, globalStateToSave(state));
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

export const setPortId = (portId, save) => (dispatch, getState) => {
  dispatch({
    type: SET_MIDI_KEYBOARD_PORT_ID,
    payload: portId,
  });

  if (save) {
    saveGlobalData(getState());
  }
};
