import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import midiConstants from '../../util/midiConstants';
import MidiDeviceSelection from '../MidiDeviceSelection';

class LedStripOutput extends React.Component {
  constructor(props) {
    super(props);

    this.LED_STRIP_CHANNEL = 0; //LED strip only listens to one channel

    this.handleChangePort = this.handleChangePort.bind(this);
    this.onNoteOn = this.onNoteOn.bind(this);
    this.onNoteOff = this.onNoteOff.bind(this);
    this.sendMidiMessage = this.sendMidiMessage.bind(this);
    this.shouldDisplayNote = this.shouldDisplayNote.bind(this);

    this.state = {
      selectedPortId: '',
    };

    this.activeMidiNotes = new Array(midiConstants.NOTE_COUNT);
    for (let i = 0; i < this.activeMidiNotes.length; i++) {
      this.activeMidiNotes[i] = new Set();
    }
  }

  sendMidiMessage(msg) {
    this.activeMidiOutput &&
      this.activeMidiOutput.send &&
      this.activeMidiOutput.send(msg);
  }

  shouldDisplayNote(note) {
    return this.props.trackSettings && 
      this.props.trackSettings[note.track].display &&
      (this.props.inputStaffs & note.staff) > 0;
  }

  onNoteOn(note) {
    if (!this.shouldDisplayNote(note)) {
      return;
    }

    if (!this.activeMidiNotes[note.noteNumber].size) {
      this.sendMidiMessage([
        midiConstants.NOTE_ON + this.LED_STRIP_CHANNEL,
        note.noteNumber,
        note.velocity,
      ]);
    }
    this.activeMidiNotes[note.noteNumber].add(note.staff);
  }

  onNoteOff(note) {
    if (!this.shouldDisplayNote(note)) {
      return;
    }

    this.activeMidiNotes[note.noteNumber].delete(note.staff);
    if (!this.activeMidiNotes[note.noteNumber].size) {
      this.sendMidiMessage([
        midiConstants.NOTE_OFF + this.LED_STRIP_CHANNEL,
        note.noteNumber,
        note.velocity,
      ]);
    }
  }

  handleChangePort(portId, port) {
    this.setState({
      selectedPortId: portId,
    });
    this.activeMidiOutput = port;
    for (let i = 0; i < this.activeMidiNotes.length; i++) {
      this.sendMidiMessage([midiConstants.NOTE_OFF, i, 0]);
    }
  }

  currentMsChanged() {
    for (let i = 0; i < this.activeMidiNotes.length; i++) {
      if (this.activeMidiNotes[i] && this.activeMidiNotes[i].size) {
        this.sendMidiMessage([midiConstants.NOTE_OFF, i, 0]);
      }
      this.activeMidiNotes[i] = new Set();
    }
  }

  render() {
    return (
      <div>
        <label>
          <span className="label">LED strip MIDI output device</span>
          <MidiDeviceSelection
            input={false}
            changePort={this.handleChangePort}
            selectedPortId={this.selectedPortId}
          />
        </label>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  trackSettings: state.player.trackSettings,
  inputStaffs: state.midiKeyboardInput.inputStaffs,
});

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }, 
)(LedStripOutput);
