import {
  LOAD_FILE_SUCCESS,
  LOAD_FILE_DATA_SUCCESS,
  TRACK_DISPLAY_UPDATE,
  TRACK_PLAY_UPDATE,
} from '../constants/actionTypes';

const initialState = {};

const applyTrackSettingsChange = (trackSettings, trackIndex, value, prop) => {
  trackSettings[trackIndex] = { ...trackSettings[trackIndex], [prop]: value };
  return [...trackSettings];
};

export default (state = initialState, action) => {
  switch (action.type) {
    case LOAD_FILE_SUCCESS:
      return { ...state, ...action.payload };
    case LOAD_FILE_DATA_SUCCESS:
      return { ...state, ...action.payload };
    case TRACK_DISPLAY_UPDATE:
      return {
        ...state,
        trackSettings: applyTrackSettingsChange(
          state.trackSettings,
          action.payload.trackIndex,
          action.payload.display,
          'display',
        ),
      };
    case TRACK_PLAY_UPDATE:
      return {
        ...state,
        trackSettings: applyTrackSettingsChange(
          state.trackSettings,
          action.payload.trackIndex,
          action.payload.play,
          'play',
        ),
      };
  }
  return { ...state };
};
