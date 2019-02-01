import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Soundfont from 'soundfont-player';
import midiKeyNumberToName from '../../util/midiKeyNumberToName';

class SoundFontOutput extends React.Component {
  constructor(props) {
    super(props);

    this.PERCUSSION_TRACK_NAME = 'Percussion';

    this.activeNotes = {};

    this.onNoteOn = this.onNoteOn.bind(this);
    this.onNoteOff = this.onNoteOff.bind(this);
    this.onNoteOnUserInput = this.onNoteOnUserInput.bind(this);
    this.onNoteOffUserInput = this.onNoteOffUserInput.bind(this);
    this.onMetronomeTick = this.onMetronomeTick.bind(this);
    this.handleToggleMute = this.handleToggleMute.bind(this);
    this.initInstruments = this.initInstruments.bind(this);
    this.playNote = this.playNote.bind(this);
    this.initMetronomeInstrument = this.initMetronomeInstrument.bind(this);

    this.state = {};
    this.instruments = null;
    this.metronomeInstrument = null;
    this.audioContext = new AudioContext();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.props.parsedMidiFile &&
      this.props.parsedMidiFile !== prevProps.parsedMidiFile
    ) {
      this.initInstruments();
      if (!this.metronomeInstrument) {
        this.initMetronomeInstrument();
      }
    }
  }

  formatInstrumentName(name) {
    return name
      .replace(/([A-Z]+)/g, ' $1') //camelCase to spaces
      .replace(/^ /, '') //remove leading space
      .toLowerCase()
      .replace(/ +/g, '_') //replace all spaces with _
      .replace(/\W/g, ''); //remove all non word chars
  }

  initInstruments() {
    this.instruments = null;
    Promise.all(
      this.props.parsedMidiFile
        .getStaves()
        .map(t =>
          Soundfont.instrument(
            this.audioContext,
            this.formatInstrumentName(t.instrumentName),
            t.instrumentName === this.PERCUSSION_TRACK_NAME
              ? { soundfont: 'FluidR3_GM' }
              : null,
          ),
        ),
    ).then(instruments => (this.instruments = instruments));
  }

  initMetronomeInstrument() {
    Soundfont.instrument(
      this.audioContext,
      this.formatInstrumentName('Xylophone'),
    ).then(instrument => (this.metronomeInstrument = instrument));
  }

  noteObjectKey(noteNumber, noteChannel) {
    return `${noteNumber}_${noteChannel}`;
  }

  playNote(note) {
    if (
      this.state.mute ||
      (this.props.trackSettings && !this.props.trackSettings[note.track].play)
    ) {
      return;
    }

    if (!this.instruments || !this.instruments[note.track]) {
      return;
    }

    this.instruments[note.track].play(midiKeyNumberToName(note.noteNumber), 0, {
      duration: note.durationMs > 0 ? note.durationMs / 1000 : undefined,
      gain: note.velocity / 127,
    });
  }

  onNoteOn(note) {
    if (this.props.waitForInput && (this.props.inputStaffs & note.staff) > 0) {
      return;
    }

    this.playNote(note);
  }

  onNoteOnUserInput(note) {
    //Don't know how long user will play the note for so use 30 second default.
    //When user releases the note onNoteOff can be called to stop it instead
    this.playNote({ ...note, durationMs: 30000 });
  }

  onNoteOff(note) {
    const key = this.noteObjectKey(note.noteNumber, note.channel);
    if (this.activeNotes[key]) {
      if (note.durationMs > 0) {
        this.activeNotes[key].stop();
      }
      this.activeNotes[key] = null;
    }
  }

  onNoteOffUserInput(note) {
    this.onNoteOff(note);
  }

  onMetronomeTick(start) {
    if (!this.props.metronomeEnabled) {
      return;
    }

    this.metronomeInstrument &&
      this.metronomeInstrument.play(start ? 'E5' : 'C5', 0, {
        duration: 100 / 1000,
        gain: 0.5,
      });
  }

  handleToggleMute() {
    this.setState({
      mute: !this.state.mute,
    });
  }

  render() {
    return <span />;
  }
}

const mapStateToProps = state => ({
  parsedMidiFile: state.parsedMidiFile,
  trackSettings: state.player.trackSettings,
  metronomeEnabled: state.player.metronomeEnabled,
  inputStaffs: state.midiKeyboardInput.inputStaffs,
  waitForInput: state.midiKeyboardInput.waitForInput,
});

SoundFontOutput.propTypes = {
  parsedMidiFile: PropTypes.object,
  trackSettings: PropTypes.array,
};

export default connect(
  mapStateToProps,
  null,
  null,
  { forwardRef: true },
)(SoundFontOutput);
