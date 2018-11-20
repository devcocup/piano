import storage from '../util/storage';
import songSettingsUtil from '../util/songSettingsUtil';
import { PLAYER } from '../constants/reducerNames';

import {
  PLAY,
  PAUSE,
  SET_TEMPO,
  TRACK_DISPLAY_UPDATE,
  TRACK_PLAY_UPDATE,
  INIT_PLAYER_TRACK_SETTINGS,
} from '../constants/actionTypes';

const playerStateToSave = state => ({
  tempo: state.tempo,
  trackSettings: state.trackSettings,
});

const saveFileData = state => {
  if (state.midiFileName) {
    storage.saveFileData(
      state.midiFileName,
      PLAYER,
      playerStateToSave(state[PLAYER]),
    );
  }
  return state;
};

const applyExistingTrackSettingsIfValid = (
  existingTrackSettings,
  trackSettingsDefault,
) =>
  !existingTrackSettings ||
  trackSettingsDefault.length !== existingTrackSettings.length ||
  trackSettingsDefault.some(
    (_, i) => trackSettingsDefault[i].name !== existingTrackSettings[i].name,
  )
    ? trackSettingsDefault
    : existingTrackSettings;

const applyTrackSettings = state => {
  const parsedMidiFile = state.parsedMidiFile;
  parsedMidiFile &&
    songSettingsUtil.applyTrackSettings(
      parsedMidiFile.getMidiOptions(),
      state.player.trackSettings,
    );
}

export const play = () => ({
  type: PLAY,
});

export const pause = () => ({
  type: PAUSE,
});

export const setTempo = tempo => (dispatch, getState) => {
  dispatch({
    type: SET_TEMPO,
    payload: tempo,
  });

  saveFileData(getState());
};

export const updateTrackDisplay = (trackIndexes, display) => (
  dispatch,
  getState,
) => {
  dispatch({
    type: TRACK_DISPLAY_UPDATE,
    payload: {
      trackIndexes,
      display,
    },
  });

  saveFileData(getState());
  applyTrackSettings(getState());
};

export const updateTrackPlay = (trackIndexes, play) => (dispatch, getState) => {
  dispatch({
    type: TRACK_PLAY_UPDATE,
    payload: {
      trackIndexes,
      play,
    },
  });

  saveFileData(getState());
};

export const initPlayer = () => (dispatch, getState) => {
  const trackSettingsDefault = songSettingsUtil.loadTrackSettingsFromParsedMidiFile(
    getState().parsedMidiFile,
  );

  const existingTrackSettings = getState().player.trackSettings;
  const trackSettings = applyExistingTrackSettingsIfValid(
    existingTrackSettings,
    trackSettingsDefault,
  );

  dispatch({
    type: INIT_PLAYER_TRACK_SETTINGS,
    payload: trackSettings,
  });

  applyTrackSettings(getState());
};
