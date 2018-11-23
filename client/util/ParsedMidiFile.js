import '../external/MidiSheetMusic/build/bridge';
import '../external/MidiSheetMusic/build/MidiSheetMusicBridge';
import midiConstants from './midiConstants';
import bridgeListToIterable from './bridgeListToIterable';

export default class ParsedMidiFile {
  constructor(file, fileName) {
    this.notes = [];
    this.displayTracks = [];

    this.parseFile = this.parseFile.bind(this);
    this.populateNotes = this.populateNotes.bind(this);
    this.getNotes = this.getNotes.bind(this);
    this.getPulsesPerMsec = this.getPulsesPerMsec.bind(this);
    this.getMeasure = this.getMeasure.bind(this);
    this.getTotalPulses = this.getTotalPulses.bind(this);
    this.getMidiFile = this.getMidiFile.bind(this);
    this.getMidiOptions = this.getMidiOptions.bind(this);
    this.getStaves = this.getStaves.bind(this);
    this.getDisplayTracks = this.getDisplayTracks.bind(this);
    this.populateNoteStaffs = this.populateNoteStaffs.bind(this);

    this.parseFile(file, fileName);
  }

  generateDisplayNotesMap(displayTracks) {
    const displayNotesMap = new Map();
    Array.from(bridgeListToIterable(displayTracks)).forEach((track, trackIndex) => {
      Array.from(bridgeListToIterable(track.Notes)).forEach(note => {
        displayNotesMap.set(note.id, trackIndex);
      });
    });
    return displayNotesMap;
  }

  generateNewDisplayTracks() {
    this.displayTracks = this.midiFile.ChangeMidiNotes(this.midiOptions);
    this.populateNoteStaffs(this.generateDisplayNotesMap(this.displayTracks));
  }

  populateNoteStaffs(displayNotesMap) {
    this.notes.forEach(note => {
      const displayNoteStaff = displayNotesMap.get(note.id);
      note.staff = displayNoteStaff === undefined ? -1 : displayNoteStaff;
    });
  }

  parseFile(file, fileName) {
    const fileArray = new Uint8Array(file);
    this.midiFile = new MidiSheetMusic.MidiFile(fileArray, fileName);
    this.midiOptions = new MidiSheetMusic.MidiOptions.$ctor1(this.midiFile);
    this.midiOptions.twoStaffs = true;
    this.populateNotes(this.midiFile, this.midiOptions, this.midiFile.Tracks);
    this.generateNewDisplayTracks();
  }

  populateNotes(midiFile, midiOptions, tracks) {
    this.pulsesPerMsec = midiFile.Time.Quarter * (1000 / midiOptions.tempo);
    this.totalPulses = midiFile.TotalPulses;
    this.measure = midiFile.Time.Measure;

    let minNote = midiConstants.NOTE_COUNT,
      maxNote = 0;

    this.notes = Array.from(bridgeListToIterable(tracks)).reduce(
      (acc, track, trackIndex) =>
        acc.concat(
          Array.from(bridgeListToIterable(track.Notes)).map(note => {
            if (note.notenumber > maxNote) {
              maxNote = note.notenumber;
            }
            if (note.notenumber < minNote) {
              minNote = note.notenumber;
            }
            return {
              id: note.id,
              startTimeMs: note.starttime / this.pulsesPerMsec,
              durationMs: note.duration / this.pulsesPerMsec,
              noteNumber: note.notenumber,
              staff: -1,
              channel: note.channel,
              track: trackIndex,
              velocity: note.velocity,
            };
          }),
        ),
      [],
    );
  }

  getPulsesPerMsec() {
    return this.pulsesPerMsec;
  }

  getTotalPulses() {
    return this.totalPulses;
  }

  getMeasure() {
    return this.measure;
  }

  getMidiFile() {
    return this.midiFile;
  }

  getMidiOptions() {
    return this.midiOptions;
  }

  getNotes(fromMs, toMs) {
    if (!fromMs && !toMs) {
      return [...this.notes];
    }

    return this.notes.filter(n => {
      const endTimeMs = n.startTimeMs + n.durationMs;
      return fromMs - n.startTimeMs >= 0 && endTimeMs - toMs >= 0;
    });
  }

  getStaves() {
    const tracks = [];
    this.midiFile.Tracks.forEach(t => tracks.push(t));
    return tracks.map(t => ({ instrumentName: t.InstrumentName }));
  }

  getDisplayTracks() {
    return this.displayTracks;
  }
}
