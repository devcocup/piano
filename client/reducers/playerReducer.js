import {
  PLAY,
  PAUSE,
  SET_TEMPO,
  LOAD_FILE_SUCCESS,
  TRACK_DISPLAY_UPDATE,
  TRACK_PLAY_UPDATE,
  SET_METRONOME_ENABLED,
  INIT_PLAYER_TRACK_SETTINGS,
} from '../constants/actionTypes';

const initialState = {
  isPlaying: false,
  tempo: 100,
};

const applyTrackSettingsChange = (trackSettings, trackIndexes, value, prop) => {
  const updated = [...trackSettings];
  trackIndexes.forEach(trackIndex => {
    updated[trackIndex] = { ...updated[trackIndex], [prop]: value };
  });
  return updated;
};

export default (state = initialState, action) => {
  switch (action.type) {
    case PLAY:
      return { ...state, isPlaying: true };
    case PAUSE:
      return { ...state, isPlaying: false };
    case SET_TEMPO:
      return { ...state, tempo: action.payload };
    case LOAD_FILE_SUCCESS:
      return { ...state, trackSettings: action.payload.trackSettings };
    case TRACK_DISPLAY_UPDATE:
      return {
        ...state,
        trackSettings: applyTrackSettingsChange(
          state.trackSettings,
          action.payload.trackIndexes,
          action.payload.display,
          'display',
        ),
      };
    case TRACK_PLAY_UPDATE:
      return {
        ...state,
        trackSettings: applyTrackSettingsChange(
          state.trackSettings,
          action.payload.trackIndexes,
          action.payload.play,
          'play',
        ),
      };
    case SET_METRONOME_ENABLED:
      return {
        ...state,
        metronomeEnabled: action.payload,
      };
    case INIT_PLAYER_TRACK_SETTINGS:
      return {
        ...state,
        trackSettings: [...action.payload],
      };
  }
  return state;
};
