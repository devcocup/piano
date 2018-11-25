import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import midiConstants from '../../util/midiConstants';
import MidiDeviceSelection from '../MidiDeviceSelection';
import {
  setWaitForInput,
  setInputStaffs,
} from '../../actions/midiKeyboardInputActions';
import { play, pause } from '../../actions/playerActions';

class MidiKeyboardInput extends React.Component {
  constructor(props) {
    super(props);

    this.LIMIT_MS = 100;

    this.hands = [
      { staff: 3, name: 'Both hands' },
      { staff: 2, name: 'Left hand' },
      { staff: 1, name: 'Right hand' },
    ];

    this.input = {
      notesPressed: [],
      keyBuffer: [],
      notesRequired: [],
    };

    this.onMidiMessage = this.onMidiMessage.bind(this);
    this.setActiveMidiInput = this.setActiveMidiInput.bind(this);
    this.animate = this.animate.bind(this);
    this.handleToggleWaitForInput = this.handleToggleWaitForInput.bind(this);
    this.onNoteOn = this.onNoteOn.bind(this);
    this.checkInput = this.checkInput.bind(this);
    this.clearNotesRequired = this.clearNotesRequired.bind(this);
    this.currentMsChanged = this.currentMsChanged.bind(this);
    this.handleChangePort = this.handleChangePort.bind(this);
    this.handleChangeStaff = this.handleChangeStaff.bind(this);
    this.noteFoundInKeyBuffer = this.noteFoundInKeyBuffer.bind(this);
    this.getTrackOfNoteToPlay = this.getTrackOfNoteToPlay.bind(this);

    this.notesPlaying = new Set();
  }

  noteFoundInKeyBuffer(noteNumber) {
    for (let i = 0; i < this.input.keyBuffer.length; i++) {
      let key = this.input.keyBuffer[this.input.keyBuffer.length - i - 1];
      if (
        key.alreadyMatched ||
        this.globalTimestamp - key.globalTimestamp > this.LIMIT_MS 
      ) {
        return null;
      }
      if (key.key === noteNumber) {
        return key;
      }
    }
    return null;
  }

  clearNotesRequired() {
    this.input.notesRequired = [];
    clearTimeout(this.waitingTimeout);
    this.waitingTimeout = null;
  }

  checkInput() {
    const notesFoundInKeyBuffer = this.input.notesRequired.map(
      noteRequired => this.noteFoundInKeyBuffer(noteRequired.noteNumber)
    );

    if (notesFoundInKeyBuffer.every(n => n)) {
      notesFoundInKeyBuffer.forEach(n => (n.alreadyMatched = true));
      this.clearNotesRequired();
      this.props.play();
    }
  }

  getTrackOfNoteToPlay() {
    const latestNoteRequired = this.input.notesRequired[this.input.notesRequired.length-1];
    if (latestNoteRequired) {
      return latestNoteRequired.track;
    }
    return 0;
  }

  onMidiMessage(evt) {
    let updatedNotes = null;
    const [message, noteNumber, velocity] = evt.data;
    if (message === midiConstants.NOTE_OFF) {
      if (this.notesPlaying.has(noteNumber)) {
        this.props.callbacks.noteOffUserInput({
          noteNumber,
          channel: 0,
        });
      }
      updatedNotes = this.input.notesPressed.filter(n => n !== noteNumber);
    } else if (message === midiConstants.NOTE_ON) {
      this.props.callbacks.noteOnUserInput({
        noteNumber,
        channel: 0,
        track: this.getTrackOfNoteToPlay(),
        velocity,
      });
      this.notesPlaying.add(noteNumber);

      if (!this.input.notesPressed.includes(noteNumber)) {
        updatedNotes = [...this.input.notesPressed, noteNumber];
      }

      this.input.keyBuffer.push({
        key: noteNumber,
        globalTimestamp: this.globalTimestamp,
        playerTimeMillis: this.playerTimeMillis,
      });
    }
    if (updatedNotes) {
      this.input.notesPressed = updatedNotes;
    }

    if (this.props.waitForInput) {
      this.checkInput();
    }
  }

  animate(playerTimeMillis, timestamp) {
    this.playerTimeMillis = playerTimeMillis;
    this.globalTimestamp = timestamp;

    if (
      this.props.waitForInput &&
      this.input.notesRequired.length &&
      !this.waitingTimeout &&
      this.props.isPlaying
    ) {
      this.props.pause();
    }
  }

  setActiveMidiInput(input) {
    if (input) {
      input.onmidimessage = this.onMidiMessage;
    }
    this.activeMidiInput = input;
  }

  onNoteOn(note) {
    if (this.props.waitForInput && (this.props.inputStaffs & note.staff) > 0) {
      this.input.notesRequired.push({ noteNumber: note.noteNumber, track: note.track });
    }
  }

  handleToggleWaitForInput() {
    this.clearNotesRequired();
    this.props.setWaitForInput(!this.props.waitForInput);
  }

  currentMsChanged() {
    this.clearNotesRequired();
  }

  handleChangePort(portId, port) {
    this.setActiveMidiInput(port);
  }

  handleChangeStaff(evt) {
    this.props.setInputStaffs(parseInt(evt.target.value, 10));
  }

  render() {
    return (
      <div>
        <label className="section">
          <span className="label">MIDI input device</span>
          <MidiDeviceSelection
            input={true}
            changePort={this.handleChangePort}
            selectedPortId={this.selectedPortId}
          />
        </label>
        <label className="section">
          <input
            type="checkbox"
            checked={this.props.waitForInput}
            onClick={this.handleToggleWaitForInput}
          />{' '}
          Wait for correct input
        </label>
        <span className="section">
          {this.hands.map(hand => (
            <label className="section" key={hand.staff}>
              <input
                type="radio"
                name="hand"
                disabled={!this.props.waitForInput}
                value={hand.staff}
                checked={this.props.inputStaffs === hand.staff}
                onChange={this.handleChangeStaff}
              />{' '}
              {hand.name}
            </label>
          ))}
        </span>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  inputStaffs: state.midiKeyboardInput.inputStaffs,
  waitForInput: state.midiKeyboardInput.waitForInput,
  isPlaying: state.player.isPlaying,
});

const mapDispatchToProps = dispatch => ({
  play: () => dispatch(play()),
  pause: () => dispatch(pause()),
  setWaitForInput: waitForInput => dispatch(setWaitForInput(waitForInput)),
  setInputStaffs: inputStaffs => dispatch(setInputStaffs(inputStaffs)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  null,
  { withRef: true },
)(MidiKeyboardInput);
