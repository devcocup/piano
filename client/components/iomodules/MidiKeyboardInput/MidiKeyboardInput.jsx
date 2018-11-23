import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import midiConstants from '../../../util/midiConstants';
import MidiDeviceSelection from '../../MidiDeviceSelection';
import {
  setWaitForInput,
  setInputStaffs,
} from '../../../actions/midiKeyboardInputActions';

class MidiKeyboardInput extends React.Component {
  constructor(props) {
    super(props);

    this.LIMIT_MS = 100;

    this.hands = [
      { staff: 3, name: 'Both hands' },
      { staff: 1, name: 'Left hand' },
      { staff: 2, name: 'Right hand' },
    ];

    this.state = {
      notesPressed: [],
    };

    this.onMidiMessage = this.onMidiMessage.bind(this);
    this.setActiveMidiInput = this.setActiveMidiInput.bind(this);
    this.animate = this.animate.bind(this);
    this.handleToggleWaitForInput = this.handleToggleWaitForInput.bind(this);
    this.noteOn = this.noteOn.bind(this);
    this.checkInput = this.checkInput.bind(this);
    this.clearNotesRequired = this.clearNotesRequired.bind(this);
    this.currentMsChanged = this.currentMsChanged.bind(this);
    this.handleChangePort = this.handleChangePort.bind(this);
    this.handleChangeStaff = this.handleChangeStaff.bind(this);

    this.keyBuffer = [];
    this.notesRequired = [];
  }

  noteFoundInKeyBuffer(noteNumber) {
    for (let i = 0; i < this.keyBuffer.length; i++) {
      let key = this.keyBuffer[this.keyBuffer.length - i - 1];
      if (this.globalTimestamp - key.globalTimestamp > this.LIMIT_MS) {
        return false;
      }
      if (key.key === noteNumber) {
        return true;
      }
    }
    return false;
  }

  clearNotesRequired() {
    this.notesRequired = [];
    clearTimeout(this.waitingTimeout);
    this.waitingTimeout = null;
  }

  checkInput() {
    if (
      this.notesRequired.every(required => this.noteFoundInKeyBuffer(required))
    ) {
      this.clearNotesRequired();
      this.props.play();
    }
  }

  onMidiMessage(evt) {
    let updatedNotes = null;
    const [message, key] = evt.data;
    if (message === midiConstants.NOTE_OFF) {
      updatedNotes = this.state.notesPressed.filter(n => n !== key);
    } else if (message === midiConstants.NOTE_ON) {
      if (!this.state.notesPressed.includes(key)) {
        updatedNotes = [...this.state.notesPressed, key];
      }
      this.keyBuffer.push({
        key,
        globalTimestamp: this.globalTimestamp,
        playerTimeMillis: this.playerTimeMillis,
      });
    }
    if (updatedNotes) {
      this.setState({
        notesPressed: updatedNotes,
      });
    }

    if (this.props.waitForInput) {
      this.checkInput();
    }
  }

  animate(playerTimeMillis, parsedMidiFile, timestamp) {
    this.playerTimeMillis = playerTimeMillis;
    this.globalTimestamp = timestamp;

    if (
      this.props.waitForInput &&
      this.notesRequired.length &&
      !this.waitingTimeout
    ) {
      this.waitingTimeout = setTimeout(() => {
        this.props.pause();
      }, 100);
    }
  }

  setActiveMidiInput(input) {
    if (input) {
      input.onmidimessage = this.onMidiMessage;
    }
    this.activeMidiInput = input;
  }

  noteOn(note) {
    if (this.props.waitForInput && (this.props.inputStaffs & note.staff) > 0) {
      this.notesRequired.push(note.noteNumber);
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
        {this.state.notesPressed.join(',')}
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
