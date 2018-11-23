import { WAIT_FOR_INPUT_CHANGED, INPUT_STAFFS_CHANGED } from '../constants/actionTypes';

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
  }
  return state;
};
