import React from 'react';
import midiConstants from '../../../util/midiConstants';
import MidiDeviceSelection from '../../MidiDeviceSelection';

export default class MidiKeyboardInput extends React.Component {
  constructor(props) {
    super(props);

    this.LIMIT_MS = 100;
    
    this.hands = [{staff: 0, name: 'Right hand'},
      {staff: 1, name: 'Left hand'},
      {staff: -1, name: 'Both'}];

    this.state = {
      notesPressed: [],
      staff: this.hands[this.hands.length-1].staff,
      waitForInput: false,
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
    this.loadData = this.loadData.bind(this);
    this.saveData = this.saveData.bind(this);
    
    this.keyBuffer = [];
    this.notesRequired = [];
  }

  noteFoundInKeyBuffer(noteNumber) {
    for (let i=0; i < this.keyBuffer.length; i++) {
      let key = this.keyBuffer[this.keyBuffer.length - i - 1];
      if (this.globalTimestamp - key.globalTimestamp > this.LIMIT_MS) {
        return false;
      }
      if (key.key === noteNumber)  {
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
    if (this.notesRequired.every(required => this.noteFoundInKeyBuffer(required))) {
      this.clearNotesRequired();
      this.props.setPlaying(true);
    }
  }

  onMidiMessage(evt) {
    let updatedNotes = null;
    const [ message, key, velocity ] = evt.data;
    if (message === midiConstants.NOTE_OFF) {
      updatedNotes = this.state.notesPressed.filter(n => n !== key);
    } else if (message === midiConstants.NOTE_ON) {
      if (!this.state.notesPressed.includes(key)) {
        updatedNotes = [ ...this.state.notesPressed, key ];
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

    if (this.state.waitForInput) {
      this.checkInput();
    }
  }

  animate(playerTimeMillis, parsedMidiFile, timestamp) {
    this.playerTimeMillis = playerTimeMillis;
    this.globalTimestamp = timestamp;

    if (this.state.waitForInput && this.notesRequired.length && !this.waitingTimeout) {
      this.waitingTimeout = setTimeout(() => {
        this.props.setPlaying(false);
      }, 100);
    }
  }

  setActiveMidiInput(input) {
    input.onmidimessage = this.onMidiMessage;
    this.activeMidiInput = input;
  }

  noteOn(note) {
    if (this.state.waitForInput && (this.state.staff === -1 || this.state.staff === note.staff)) {
      this.notesRequired.push(note.noteNumber);
    }
  }

  handleToggleWaitForInput() {
    this.clearNotesRequired();

    const newState = { waitForInput: !this.state.waitForInput };
    this.setState(newState);
    this.saveData(newState);
  }

  currentMsChanged() {
    this.clearNotesRequired();
  }

  handleChangePort(portId, port) {
    this.setActiveMidiInput(port);
  }

  handleChangeStaff(evt) {
    const newState = { staff: parseInt(evt.target.value, 10) };
    this.setState(newState);
    this.saveData(newState);
  }

  loadData(data) {
    this.setState(data);
  }

  saveData(toMerge) {
    this.props.saveData && this.props.saveData({
      waitForInput: this.state.waitForInput,
      staff: this.state.staff,
      ...toMerge,
    });
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
          <input type="checkbox" checked={this.state.waitForInput} onClick={this.handleToggleWaitForInput} /> Wait for correct input
        </label>
        <span className="section">
          {this.hands.map(hand => 
              <label className="section" key={hand.staff}>
                <input 
                  type="radio"
                  name="hand"
                  disabled={!this.state.waitForInput} 
                  value={hand.staff}
                  checked={this.state.staff === hand.staff}
                  onChange={this.handleChangeTrack} /> {hand.name}
              </label>)}
        </span>
        { this.state.notesPressed.join(',') }
      </div>
    );
  }
}