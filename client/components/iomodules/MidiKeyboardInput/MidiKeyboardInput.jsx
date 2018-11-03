import React from 'react';
import midiIo from '../../../util/midiIo';
import midiConstants from '../../../util/midiConstants';

export default class MidiKeyboardInput extends React.Component {
  constructor(props) {
    super(props);

    this.LIMIT_MS = 100;
    
    this.hands = [{track: 0, name: 'Right hand'},
      {track: 1, name: 'Left hand'},
      {track: -1, name: 'Both'}];

    this.state = {
      availableMidiInputs: {},
      notesPressed: [],
      track: this.hands[this.hands.length-1].track,
      waitForInput: false,
    };

    this.init = this.init.bind(this);
    this.onMidiMessage = this.onMidiMessage.bind(this);
    this.setActiveMidiInput = this.setActiveMidiInput.bind(this);
    this.animate = this.animate.bind(this);
    this.handleToggleWaitForInput = this.handleToggleWaitForInput.bind(this);
    this.noteOn = this.noteOn.bind(this);
    this.checkInput = this.checkInput.bind(this);
    this.clearNotesRequired = this.clearNotesRequired.bind(this);
    this.currentMsChanged = this.currentMsChanged.bind(this);
    this.handleChangeInput = this.handleChangeInput.bind(this);
    this.handleChangeTrack = this.handleChangeTrack.bind(this);
    this.loadData = this.loadData.bind(this);
    this.saveData = this.saveData.bind(this);
    
    this.keyBuffer = [];
    this.notesRequired = [];

    this.init();
  }

  init() {
    midiIo.get().then(midi => {
      const availableMidiInputs = {};
      midi.inputs.forEach(input => {
        availableMidiInputs[input.id] = input;
        if (!this.activeMidiInput) {
          this.setActiveMidiInput(input);
        }
      });
      this.setState({
        availableMidiInputs,
      });
    });
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
    if (this.state.waitForInput && (this.state.track === -1 || this.state.track === note.track)) {
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

  handleChangeInput(evt) {
    this.setActiveMidiInput(this.state.availableMidiInputs[evt.target.value]);
  }

  handleChangeTrack(evt) {
    const newState = { track: parseInt(evt.target.value, 10) };
    this.setState(newState);
    this.saveData(newState);
  }

  loadData(data) {
    this.setState(data);
  }

  saveData(toMerge) {
    this.props.saveData && this.props.saveData({
      waitForInput: this.state.waitForInput,
      track: this.state.track,
      ...toMerge,
    });
  }


  render() {
    return (
       <div>
        <label className="section">
          <span className="label">MIDI input device</span>
          <select onChange={this.handleChangeInput}>
            { Object.values(this.state.availableMidiInputs).map(input =>
              <option key={input.id} value={input.id}>{input.name}</option>
            ) }
          </select>
        </label>
        <label className="section">
          <input type="checkbox" checked={this.state.waitForInput} onClick={this.handleToggleWaitForInput} /> Wait for correct input
        </label>
        <span className="section">
          {this.hands.map(hand => 
              <label className="section" key={hand.track}>
                <input 
                  type="radio"
                  name="hand"
                  disabled={!this.state.waitForInput} 
                  value={hand.track}
                  checked={this.state.track === hand.track}
                  onChange={this.handleChangeTrack} /> {hand.name}
              </label>)}
        </span>
        { this.state.notesPressed.join(',') }
      </div>
    );
  }
}