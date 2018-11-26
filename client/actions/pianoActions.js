import storage from '../util/storage';
import base64ToArrayBuffer from '../util/base64ToArrayBuffer';
import arrayBufferToBase64 from '../util/arrayBufferToBase64';
import sampleSong from '../external/MidiSheetMusic/songs/Beethoven__Moonlight_Sonata.mid';
import ParsedMidiFile from '../util/ParsedMidiFile';
import { initPlayer } from './playerActions';
import { PIANO_KEY } from '../constants/storageKeys';
import * as reducerNames from '../constants/reducerNames';
import {
  LOAD_FILE_SUCCESS,
  LOAD_FILE_DATA_SUCCESS,
} from '../constants/actionTypes';

const SAMPLE_SONG_NAME = 'Beethoven__Moonlight_Sonata.mid';

const loadSampleData = () =>
  fetch(sampleSong)
    .then(response => response.blob())
    .then(blob => readFile(blob, SAMPLE_SONG_NAME));

const readFile = (file, filename) =>
  new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => resolve({ arrayBuffer: e.target.result, filename });
    reader.readAsArrayBuffer(file);
  });

const stateToSave = state => ({
  midiArrayBuffer: state.midiArrayBuffer,
  midiFileName: state.midiFileName,
});

const fileLoaded = (arrayBuffer, filename, moduleData) => {
  const parsedMidiFile = new ParsedMidiFile(arrayBuffer, filename);
  return {
    type: LOAD_FILE_SUCCESS,
    payload: {
      parsedMidiFile,
      midiArrayBuffer: arrayBufferToBase64(arrayBuffer),
      midiFileName: filename,
      moduleData,
    },
  };
};

const fileDataLoaded = data => dispatch => {
  dispatch({
    type: LOAD_FILE_DATA_SUCCESS,
    payload: {
      moduleData: {
        ...data,
      },
    },
  });

  dispatch(initPlayer());
};

export const loadFile = file => (dispatch, getState) =>
  readFile(file, file.name)
    .then(result => dispatch(fileLoaded(result.arrayBuffer, result.filename, null)))
    .then(result => dispatch(loadFileData(result.payload.midiFileName)))
    .then(() => storage.saveGlobalData(PIANO_KEY, stateToSave(getState())));

export const loadGlobalData = () => dispatch =>
  storage
    .loadGlobalData()
    .then(data => {
      if (
        data &&
        data[PIANO_KEY] &&
        data[PIANO_KEY].midiArrayBuffer
      ) {
        return dispatch(
          fileLoaded(
            base64ToArrayBuffer(data[PIANO_KEY].midiArrayBuffer),
            data[PIANO_KEY].midiFileName,
            Object.values(reducerNames).reduce((acc, val)=>{
              data[val] && (acc[val] = data[val]);
              return acc;
            }, {})
          ),
        );
      }

      return loadSampleData().then(result =>
        dispatch(fileLoaded(result.arrayBuffer, result.filename, null)),
      );
    })
    .then(result => dispatch(loadFileData(result.payload.midiFileName)));

export const loadFileData = filename => dispatch =>
  storage
    .loadFileData(filename)
    .then(result => dispatch(fileDataLoaded(result || {})));
