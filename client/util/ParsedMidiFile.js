import '../external/MidiSheetMusic/build/bridge';
import '../external/MidiSheetMusic/build/MidiSheetMusicBridge';
import midiConstants from './midiConstants';

export default class ParsedMidiFile {
  constructor(file, fileName) {
    this.notes = [];
    this.tracks = [];

    this.parseFile = this.parseFile.bind(this);
    this.populateNotes = this.populateNotes.bind(this);
    this.getNotes = this.getNotes.bind(this);
    this.getPulsesPerMsec = this.getPulsesPerMsec.bind(this);
    this.getTracks = this.getTracks.bind(this);

    this.parseFile(file, fileName);
  }

  parseFile(file, fileName) {
    const fileArray = new Uint8Array(file);
    const midiFile = new MidiSheetMusic.MidiFile(fileArray, fileName);
    const midiOptions = new MidiSheetMusic.MidiOptions.$ctor1(midiFile);
    const tracks = midiFile.ChangeMidiNotes(midiOptions);

    this.populateNotes(midiFile, midiOptions, tracks);
  }

  populateNotes(midiFile, midiOptions, tracks) {
    this.pulsesPerMsec = midiFile.Time.Quarter * (1000 / midiOptions.tempo);
    let minNote = midiConstants.NOTE_COUNT, maxNote = 0;
 
    for (let i=0; i < tracks.Count; i++) {
      this.tracks.push({name: tracks.getItem(i).InstrumentName});

      for (let j=0; j < tracks.getItem(i).Notes.Count; j++) {
        const note = tracks.getItem(i).Notes.getItem(j);
        if (note.notenumber > maxNote) {
          maxNote = note.notenumber;
        }
        if (note.notenumber < minNote) {
          minNote = note.notenumber;
        }
        this.notes.push({
          startTimeMs: note.starttime / this.pulsesPerMsec,
          durationMs: note.duration / this.pulsesPerMsec,
          noteNumber: note.notenumber,
          track: i,
        });
      }
    }
  }

  getPulsesPerMsec() {
    return this.pulsesPerMsec;
  }

  getNotes(fromMs, toMs) {
    if (!fromMs && !toMs) {
      return [...this.notes];
    }

    return this.notes.filter(n => {
      const endTimeMs = n.startTimeMs + n.durationMs;
      return fromMs - n.startTimeMs >= 0 && endTimeMs - toMs >=0;
    });
  }

  getTracks() {
    return this.tracks;
  }
}