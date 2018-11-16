import storage from '../util/storage';

import {
  SHEET_MUSIC_SELECTION_CHANGED,
  SHEET_MUSIC_AUTOSCROLL_CHANGED,
} from '../constants/actionTypes';

import { SHEET_MUSIC_OUTPUT, PLAYER } from '../constants/reducerNames';

export const setSelection = selection => (dispatch, getState) => {
  dispatch({
    type: SHEET_MUSIC_SELECTION_CHANGED,
    payload: { ...selection },
  });

  saveFileData(getState());
};

export const setAutoScroll = autoScroll => ({
  type: SHEET_MUSIC_AUTOSCROLL_CHANGED,
  payload: autoScroll,
});

const stateToSave = state => ({
  selectionStartMs: state.selectionStartMs,
  selectionEndMs: state.selectionEndMs,
  selectionStartPulse: state.selectionStartPulse,
  selectionEndPulse: state.selectionEndPulse,
  autoScroll: state.autoScroll,
});

const saveFileData = state => {
  if (state.midiFileName) {
    storage.saveFileData(
      state.midiFileName,
      SHEET_MUSIC_OUTPUT,
      stateToSave(state[SHEET_MUSIC_OUTPUT]),
    );
  }
  return state;
};
