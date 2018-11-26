import storage from '../util/storage';
import { SET_LED_STRIP_PORT_ID } from '../constants/actionTypes';
import { LED_STRIP_OUTPUT } from '../constants/reducerNames';

const globalStateToSave = state=> ({
  portId: state[LED_STRIP_OUTPUT].portId, 
});

const saveGlobalData = state => {
  storage.saveGlobalData(LED_STRIP_OUTPUT, globalStateToSave(state));
}

export const setPortId = (portId, save) => (dispatch, getState) => {
  dispatch({
    type: SET_LED_STRIP_PORT_ID,
    payload: portId,
  });

  if (save) {
    saveGlobalData(getState());
  }

};