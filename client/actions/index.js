import storage from '../util/storage';
import base64ToArrayBuffer from '../util/base64ToArrayBuffer';
import arrayBufferToBase64 from '../util/arrayBufferToBase64';
import ParsedMidiFile from '../util/ParsedMidiFile';
import sampleSong from '../external/MidiSheetMusic/songs/Beethoven__Moonlight_Sonata.mid';

const SAMPLE_SONG_NAME = 'Beethoven__Moonlight_Sonata.mid';

import { 
  PLAY,
  PAUSE,
  SET_TEMPO,
  LOAD_FILE_SUCCESS,
} from '../constants/actionTypes';

export const play = () => ({
  type: PLAY,
});

export const pause = () => ({
  type: PAUSE,
});

export const setTempo = tempo => {
  storage.save
  return {
    type: SET_TEMPO,
    payload: tempo,
  };
};

export const loadFile = file => dispatch =>
  readFile(file, file.name)
    .then(result => dispatch(fileLoaded(result.arrayBuffer, result.filename)));

export const loadGlobalData = () => dispatch =>
  storage.loadGlobalData()
    .then(data => { 
      if (data && data.midiArrayBuffer) {
        return dispatch(fileLoaded(
          base64ToArrayBuffer(data.midiArrayBuffer), data.midiFileName));
      }

      return loadSampleData()
        .then(result => dispatch(fileLoaded(result.arrayBuffer, result.filename)));
    });

const loadSampleData = () =>
  fetch(sampleSong)
      .then(response => response.blob())
      .then(blob => readFile(blob, SAMPLE_SONG_NAME));

const readFile = (file, filename) => 
  new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => resolve({arrayBuffer: e.target.result, filename});
    reader.readAsArrayBuffer(file);
  });


const fileLoaded = (arrayBuffer, filename) => ({
  type: LOAD_FILE_SUCCESS,
  payload: {
    parsedMidiFile: new ParsedMidiFile(arrayBuffer, filename),
    midiArrayBuffer: arrayBufferToBase64(arrayBuffer),
    midiFileName: filename,
  }
});