import { SET_LED_STRIP_PORT_ID } from '../constants/actionTypes';

const initialState = {
  portId: '',
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_LED_STRIP_PORT_ID:
      return { ...state, portId: action.payload };
  }
  return state;
};
