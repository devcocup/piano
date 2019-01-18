import storage from '../util/storage';
import { SET_MIDI_OUTPUT_PORT_ID } from '../constants/actionTypes';
import { MIDI_OUTPUT } from '../constants/reducerNames';

const globalStateToSave = state => ({
  portId: state[MIDI_OUTPUT].portId,
});

const saveGlobalData = state => {
  storage.saveGlobalData(MIDI_OUTPUT, globalStateToSave(state));
};

export const setPortId = (portId, save) => (dispatch, getState) => {
  dispatch({
    type: SET_MIDI_OUTPUT_PORT_ID,
    payload: portId,
  });

  if (save) {
    saveGlobalData(getState());
  }
};
