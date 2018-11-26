import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Soundfont from 'soundfont-player';
import midiKeyNumberToName from '../../util/midiKeyNumberToName';

class SoundFontOutput extends React.Component {
  constructor(props) {
    super(props);

    this.activeNotes = {};

    this.onNoteOn = this.onNoteOn.bind(this);
    this.onNoteOff = this.onNoteOff.bind(this);
    this.onNoteOnUserInput = this.onNoteOnUserInput.bind(this);
    this.onNoteOffUserInput = this.onNoteOffUserInput.bind(this);
    this.handleToggleMute = this.handleToggleMute.bind(this);
    this.initInstruments = this.initInstruments.bind(this);
    this.playNote = this.playNote.bind(this);

    this.state = {};
    this.instruments = null;
    this.audioContext = new AudioContext();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.props.parsedMidiFile &&
      this.props.parsedMidiFile !== prevProps.parsedMidiFile
    ) {
      this.initInstruments();
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
            t.instrumentName === 'Percussion'
              ? { soundfont: 'FluidR3_GM' }
              : null,
          ),
        ),
    ).then(instruments => (this.instruments = instruments));
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

    this.activeNotes[
      this.noteObjectKey(note.noteNumber, note.channel)
    ] = this.instruments[note.track].play(
      midiKeyNumberToName(note.noteNumber),
      0,
      {
        duration: note.durationMs / 1000,
        gain: note.velocity / 127,
      },
    );
  }

  onNoteOn(note) {
    if (this.props.waitForInput && (this.props.inputStaffs & note.staff) > 0) {
      return;
    }

    this.playNote(note);
  }

  onNoteOnUserInput(note) {
    this.playNote(note);
  }

  onNoteOff(note) {
    const key = this.noteObjectKey(note.noteNumber, note.channel);
    if (this.activeNotes[key]) {
      this.activeNotes[key].stop();
      this.activeNotes[key] = null;
    }
  }

  onNoteOffUserInput(note) {
    this.onNoteOff(note);
  }

  handleToggleMute() {
    this.setState({
      mute: !this.state.mute,
    });
  }

  render() {
    return (
      <span />
      /*<div>
        <input
          type="checkbox"
          value={this.state.mute}
          onClick={this.handleToggleMute}
        />{' '}
        Mute
      </div>*/
    );
  }
}

const mapStateToProps = state => ({
  parsedMidiFile: state.parsedMidiFile,
  trackSettings: state.player.trackSettings,
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
  { withRef: true },
)(SoundFontOutput);
