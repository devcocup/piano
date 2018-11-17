import {
  SHEET_MUSIC_SELECTION_CHANGED,
  SHEET_MUSIC_AUTOSCROLL_CHANGED,
} from '../constants/actionTypes';

const initialState = {
  selectionStartMs: -1,
  selectionEndMs: -1,
  selectionStartPulse: 0,
  selectionEndPulse: 0,
  autoScroll: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SHEET_MUSIC_SELECTION_CHANGED:
      return { ...state, ...action.payload };
    case SHEET_MUSIC_AUTOSCROLL_CHANGED:
      return { ...state, autoScroll: action.payload };
  }
  return state;
};
