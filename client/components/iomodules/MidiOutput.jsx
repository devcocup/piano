import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import midiConstants from '../../util/midiConstants';
import MidiDeviceSelection from '../MidiDeviceSelection';
import { setPortId } from '../../actions/midiOutputActions';

class MidiOutput extends React.Component {
  constructor(props) {
    super(props);

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

    this.sendMidiMessage([
      (midiConstants.NOTE_ON << 4) + note.channel,
      note.noteNumber,
      note.velocity,
    ]);
    this.activeMidiNotes[note.noteNumber].add(note.channel);
  }

  onNoteOff(note) {
    if (!this.shouldDisplayNote(note)) {
      return;
    }

    this.activeMidiNotes[note.noteNumber].delete(note.channel);
    this.sendMidiMessage([
      (midiConstants.NOTE_OFF << 4) + note.channel,
      note.noteNumber,
      note.velocity,
    ]);
  }

  sendAllNoteOff() {
    for (let i = 0; i < this.activeMidiNotes.length; i++) {
      this.activeMidiNotes[i] && this.activeMidiNotes[i].forEach(channel => {
        this.sendMidiMessage([(midiConstants.NOTE_OFF << 4) + channel, i, 0]);
      });
      this.activeMidiNotes[i] = new Set();
    }
  }

  handleChangePort(portId, port, setByUser) {
    this.props.setPortId(portId, setByUser);
    this.activeMidiOutput = port;
    this.sendAllNoteOff();
  }

  currentMsChanged() {
    this.sendAllNoteOff();
  }

  render() {
    return (
      <div>
        <label>
          <span className="label">MIDI output device</span>
          <MidiDeviceSelection
            input={false}
            changePort={this.handleChangePort}
            selectedPortId={this.props.portId}
          />
        </label>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  trackSettings: state.player.trackSettings,
  inputStaffs: state.midiKeyboardInput.inputStaffs,
  portId: state.midiOutput.portId,
});

const mapDispatchToProps = dispatch => ({
  setPortId: (portId, setByUser) => dispatch(setPortId(portId, setByUser)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  null,
  { withRef: true }, 
)(MidiOutput);
