import '../external/MidiSheetMusic/build/bridge';
import '../external/MidiSheetMusic/build/MidiSheetMusicBridge';
import generateMetronome from './generateMetronome';
import midiConstants from './midiConstants';
import flatten from 'lodash/flatten';

export default class Player {
  constructor(config) {
    this.noteOn = config.noteOn;
    this.noteOff = config.noteOff;
    this.metronomeTick = config.metronomeTick;

    this.playing = false;
    this.events = [];

    this.togglePlayPause = this.togglePlayPause.bind(this);
    this.getTimeMillis = this.getTimeMillis.bind(this);
    this.isPlaying = this.isPlaying.bind(this);
    this.setIsPlaying = this.setIsPlaying.bind(this);
    this.getTempo = this.getTempo.bind(this);
    this.setTempo = this.setTempo.bind(this);
    this.getTempoPercentage = this.getTempoPercentage.bind(this);
    this.loadParsedMidiFile = this.loadParsedMidiFile.bind(this);

    this.currentTimeMs = 0;
    this.tempo = 100;
  }

  loadParsedMidiFile(parsedMidiFile) {
    this.pulsesPerMs = parsedMidiFile.getPulsesPerMsec();
    this.notes = parsedMidiFile.getNotes();
    this.beatIntervalMs = parsedMidiFile.getBeatIntervalMs();
    this.beatsPerMeasure = parsedMidiFile.getBeatsPerMeasure();
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

  getTempoPercentage() {
    return this.tempo / 100;
  }

  enqueueEvents() {
    let totalTime = 0;
    
    let toEnqueue = flatten(
      this.notes.map(n => {
        const note = {
          velocity: midiConstants.DEFAULT_VELOCITY,
          ...n,
        };

        if (totalTime < n.startTimeMs) {
          totalTime = n.startTimeMs;
        }
        const noteOnTime =
          (n.startTimeMs - this.currentTimeMs) / this.getTempoPercentage();
        const noteOffTime =
          (n.startTimeMs + n.durationMs - this.currentTimeMs) /
          this.getTempoPercentage();
        const evts = [];
        if (noteOnTime >= 0) {
          evts.push({func: () => this.noteOn(note), time: noteOnTime});
        }
        if (noteOffTime >= 0) {
          evts.push({func: () => this.noteOff(note), time: noteOffTime});
        }
        return evts;
      }),
    );

    generateMetronome(
      this.beatIntervalMs,
      this.beatsPerMeasure,
      totalTime,
    ).forEach(m => {
      const metronomeTickTime =
        (m.time - this.currentTimeMs) / this.getTempoPercentage();
      if (metronomeTickTime >= 0) {
        toEnqueue.push({func: () => this.metronomeTick(m.start), time: metronomeTickTime });
      }
    });

    this.events = toEnqueue.map(e => setTimeout(e.func, e.time));
  }

  setIsPlaying(isPlaying) {
    if (isPlaying && !this.playing) {
      this.playing = true;
      this.startTimeMs = performance.now();
      this.enqueueEvents();
    } else if (!isPlaying && this.playing) {
      this.playing = false;
      this.currentTimeMs =
        this.currentTimeMs +
        (performance.now() - this.startTimeMs) * this.getTempoPercentage();
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
      return (
        this.currentTimeMs +
        (performance.now() - this.startTimeMs) * this.getTempoPercentage()
      );
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
