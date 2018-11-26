import { SET_LED_STRIP_PORT_ID, LOAD_FILE_SUCCESS } from '../constants/actionTypes';
import { LED_STRIP_OUTPUT } from '../constants/reducerNames';

const initialState = {
  portId: '',
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_LED_STRIP_PORT_ID:
      return { ...state, portId: action.payload };
    case LOAD_FILE_SUCCESS:
      return {
        ...state,
        ...(action.payload.moduleData &&
          action.payload.moduleData[LED_STRIP_OUTPUT]),
      };
  }
  return state;
};
