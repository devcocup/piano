import MidiPlayer from 'midi-player-js';

export default class Player {
  constructor(config) {
    this.noteOn = config.noteOn;
    this.noteOff = config.noteOff;

    this.init = this.init.bind(this);
    this.loadMidiArrayBuffer = this.loadMidiArrayBuffer.bind(this);
    this.play = this.play.bind(this);
    this.togglePlayPause = this.togglePlayPause.bind(this);
    this.getTimeMillis = this.getTimeMillis.bind(this);
    this.ticksToMillis = this.ticksToMillis.bind(this);
    this.millisToTicks = this.millisToTicks.bind(this);
    this.isPlaying = this.isPlaying.bind(this);

    this.init();
  }

  init() {
    this.player = new MidiPlayer.Player(event => {
      if (event.name === 'Note on') {
        this.noteOn({ noteName: event.noteName, noteNumber: event.noteNumber });
      } else if (event.name === 'Note off') {
        this.noteOff({ noteName: event.noteName, noteNumber: event.noteNumber });
      }
    });
  }

  loadMidiArrayBuffer(midiArrayBuffer) {
    this.player.loadArrayBuffer(midiArrayBuffer);
    this.originalTempo = this.player.tempo;
  }

  play() {
    this.player.play();
  }

  isPlaying() {
    return this.player.isPlaying();
  }

  togglePlayPause() {
    if (this.player.isPlaying()) {
      this.player.pause();
      this.skipToTick = this.player.tick;
    } else {
      this.player.play();
      if (this.skipToTick) {
        this.player.skipToTick(this.skipToTick);
        this.player.play();
        this.skipToTick = null;
      }
    }
  }

  setCurrentTimeMillis(ms) {
    const wasPlaying = this.player.isPlaying();
    const tick = this.millisToTicks(ms);
    if (wasPlaying) {
      this.player.skipToTick(tick);
    } else {
      this.skipToTick = tick;
    }
    if (wasPlaying) {
      this.player.play();
    }
  }

  millisToTicks(ms) {
    return ms * this.player.division * this.originalTempo / 60000;
  }

  ticksToMillis(ticks) {
    return ticks / this.player.division / this.originalTempo * 60000;
  }

  getTimeMillis() {
    return this.ticksToMillis(this.player.tick);
  }
}