import './external/MidiSheetMusic/build/bridge';
import './external/MidiSheetMusic/build/MidiSheetMusicBridge'; 
import midiKeyNumberToName from './util/midiKeyNumberToName'
import midiConstants from './util/midiConstants';
import flatten from 'lodash/flatten';
import ParsedMidiFile from './util/ParsedMidiFile';


export default class PlayerAlt {
  constructor(config) {
    this.noteOn = config.noteOn;
    this.noteOff = config.noteOff;

    this.playing = false;
    this.events = [];

    this.loadMidiArrayBuffer = this.loadMidiArrayBuffer.bind(this);
    this.togglePlayPause = this.togglePlayPause.bind(this);
    this.getTimeMillis = this.getTimeMillis.bind(this);
    this.isPlaying = this.isPlaying.bind(this);
    this.setIsPlaying = this.setIsPlaying.bind(this);
    this.getTempo = this.getTempo.bind(this);
    this.setTempo = this.setTempo.bind(this);

    this.currentTimeMs = 0;
    this.tempo = 100;
  }

  loadMidiArrayBuffer(midiArrayBuffer) {
    const fileArray = new Uint8Array(midiArrayBuffer);
    const midiFile = new MidiSheetMusic.MidiFile(fileArray, 'midi');
    const midiOptions = new MidiSheetMusic.MidiOptions.$ctor1(midiFile);

    this.pulsesPerMs = new ParsedMidiFile(midiArrayBuffer, 'midi').getPulsesPerMsec();

    this.notes = [];
    for (let i=0; i < midiFile.tracks.Count; i++) {
      const track = midiFile.tracks.getItem(i);
      for (let j=0; j<track.notes.Count; j++) {
        const note = track.notes.getItem(j);
        this.notes.push({
          noteNumber: note.notenumber,
          startTime: note.starttime / this.pulsesPerMs,
          duration: note.duration / this.pulsesPerMs,
        });
      }
    }
  }

  isPlaying() {
    return this.playing;
  }

  togglePlayPause() {
    setIsPlaying(!this.isPlaying());
  }

  clearEvents() {
    this.events.forEach(evt => {
      clearTimeout(evt);
    });
    this.events = [];
  }

  enqueueEvents() {
    this.events = flatten(this.notes
      .filter(n => n.startTime >= this.currentTimeMs)
      .map(n => {
        const note = { 
          noteNumber: n.noteNumber, 
          noteName: midiKeyNumberToName(n.noteNumber), 
          velocity: midiConstants.DEFAULT_VELOCITY 
        };
        return [
          setTimeout(() => this.noteOn(note), (n.startTime - this.currentTimeMs) / (this.tempo / 100)),
          setTimeout(() => this.noteOff(note), (n.startTime + n.duration - this.currentTimeMs) / (this.tempo / 100))
        ] 
      })
    );
  }

  setIsPlaying(isPlaying) {
    if (isPlaying && !this.playing) {
      this.playing = true;
      this.startTimeMs = performance.now();
      this.enqueueEvents();
    } else if (!isPlaying && this.playing) {
      this.playing = false;
      this.currentTimeMs = this.currentTimeMs + (performance.now() - this.startTimeMs) * (this.tempo / 100);
      this.clearEvents();
    }
  }

  setCurrentTimeMillis(ms) {
    const wasPlaying = this.playing;
    this.setIsPlaying(false);
    this.currentTimeMs = ms;
    if (wasPlaying) {
      this.setIsPlaying(true);
    }
  }

  getTimeMillis() {
    if (this.playing) {
      return this.currentTimeMs + (performance.now() - this.startTimeMs) * (this.tempo / 100);
    } else {
      return this.currentTimeMs;
    }
  }

  getTempo() {
    return this.tempo;
  }

  setTempo(tempo) {
    const wasPlaying = this.playing;
    this.setIsPlaying(false);
    this.tempo = tempo;
    if (wasPlaying) {
      this.setIsPlaying(true);
    }
  }
}