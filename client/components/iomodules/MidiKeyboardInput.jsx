import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import midiConstants from '../../util/midiConstants';
import MidiDeviceSelection from '../MidiDeviceSelection';
import {
  setWaitForInput,
  setInputStaffs,
  setPortId,
  setInputNoteState,
} from '../../actions/midiKeyboardInputActions';
import { play, pause } from '../../actions/playerActions';

class MidiKeyboardInput extends React.Component {
  constructor(props) {
    super(props);

    this.LIMIT_MS = 200;

    this.hands = [
      { staff: 3, name: 'Both hands' },
      { staff: 2, name: 'Left hand' },
      { staff: 1, name: 'Right hand' },
    ];

    this.state = {
      notesRequired: [],
      notesPressed: [],
      notesMissed: [],
      notesHit: [],
    };

    this.notesPlaying = new Set();
  }

  playNote = (message, noteNumber, velocity) => {
    if (message === (midiConstants.NOTE_OFF << 4)) {
      if (this.notesPlaying.has(noteNumber)) {
        this.props.callbacks.noteOffUserInput({
          noteNumber,
          channel: 0,
        });
      }
    } else if (message === (midiConstants.NOTE_ON << 4)) {
      this.notesPlaying.add(noteNumber);
      this.props.callbacks.noteOnUserInput({
        noteNumber,
        channel: 0,
        track: this.getTrackOfNoteToPlay(),
        velocity,
      });
    }
  }

  onMidiMessage = evt => {
    const [message, noteNumber, velocity] = evt.data;

    this.playNote(message, noteNumber, velocity);

    if (message === (midiConstants.NOTE_ON << 4)) {
      this.setState({
        notesPressed: [
          ...this.state.notesPressed,
          { 
            noteNumber: noteNumber,
            playerTimeMillis: this.playerTimeMillis, 
          }
        ]});
    }
  }

  getTrackOfNoteToPlay = () => {
    const latestNoteRequired = this.state.notesRequired[this.state.notesRequired.length-1];
    if (latestNoteRequired) {
      return latestNoteRequired.track;
    }
    const firstDisplayTrackIndex = this.props.trackSettings.findIndex(t => t.display);
    if (firstDisplayTrackIndex >= 0) {
      return firstDisplayTrackIndex;
    }
    return 0;
  }

  animate = (playerTimeMillis, timestamp) => {
    this.playerTimeMillis = playerTimeMillis;

    const notesRequired = [...this.state.notesRequired];
    const notesMissed = [...this.state.notesMissed];
    const notesHit = [...this.state.notesHit];
    const notesPressed = this.state.notesPressed
      .filter(n => playerTimeMillis - this.LIMIT_MS < n.playerTimeMillis);;
    for (let i=0; i < notesRequired.length; i++) {
      const n = notesRequired[i];
      if (playerTimeMillis - this.LIMIT_MS > n.playerTimeMillis) {
        notesMissed.push({...n});
        notesRequired.splice(i--, 1);
        continue;
      }
      const notePressedIdx = notesPressed.findIndex(np => np.noteNumber === n.noteNumber);
      if (notePressedIdx >= 0) {
        notesPressed.splice(notePressedIdx--, 1);
        notesHit.push({...n});
        notesRequired.splice(i--, 1);
      }
    }
    
    if (this.state.notesRequired.length !== notesRequired.length ||
      this.state.notesMissed.length !== notesMissed.length ||
      this.state.notesHit.length !== notesHit.length ||
      this.state.notesPressed.length !== notesPressed.length) {
      this.setState({
        notesRequired,
        notesMissed,
        notesHit,
        notesPressed,
      });
      this.props.setInputNoteState(notesHit, notesMissed);
    }

  }

  setActiveMidiInput = input => {
    if (input) {
      input.onmidimessage = this.onMidiMessage;
    }
    this.activeMidiInput = input;
  }

  onNoteOn = note => {
    if (this.props.waitForInput && (this.props.inputStaffs & note.staff) > 0) {
      this.setState({
        notesRequired: [
          ...this.state.notesRequired,
          { 
            noteNumber: note.noteNumber,
            track: note.track,
            playerTimeMillis: this.playerTimeMillis, 
          }
        ]
      });
    }
  }

  handleToggleWaitForInput = () => {
    this.props.setWaitForInput(!this.props.waitForInput);
  }

  handleChangePort = (portId, port, setByUser) => {
    this.props.setPortId(portId, setByUser);
    this.setActiveMidiInput(port);
  }

  handleChangeStaff = evt => {
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
            selectedPortId={this.props.portId}
          />
        </label>
        <label className="section">
          <input
            type="checkbox"
            checked={!!this.props.waitForInput}
            onChange={this.handleToggleWaitForInput}
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
  trackSettings: state.player.trackSettings,
  portId: state.midiKeyboardInput.portId,
});

const mapDispatchToProps = dispatch => ({
  play: () => dispatch(play()),
  pause: () => dispatch(pause()),
  setWaitForInput: waitForInput => dispatch(setWaitForInput(waitForInput)),
  setInputStaffs: inputStaffs => dispatch(setInputStaffs(inputStaffs)),
  setPortId: (portId, setByUser) => dispatch(setPortId(portId, setByUser)),
  setInputNoteState: (hitNotes, missedNotes) => dispatch(setInputNoteState(hitNotes, missedNotes)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  null,
  { forwardRef: true },
)(MidiKeyboardInput);
