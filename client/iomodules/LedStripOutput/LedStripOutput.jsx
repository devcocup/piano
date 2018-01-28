import React from 'react';
import midiConstants from '../../util/midiConstants';
import midiIo from '../../util/midiIo';

export default class LedStripOutput extends React.Component {
  constructor(props) {
    super(props);

    this.init = this.init.bind(this);
    this.handleChangeOutput = this.handleChangeOutput.bind(this);
    this.noteOn = this.noteOn.bind(this);
    this.noteOff = this.noteOff.bind(this);
    this.setOutput = this.setOutput.bind(this);  
    this.sendMidiMessage = this.sendMidiMessage.bind(this);  
  
    this.state = {
      availableMidiOutputs: {},
    };

    this.activeMidiNotes = new Array(midiConstants.NOTE_COUNT);
    this.init();
  }

  init() {
    midiIo.get().then(midi => {
      const availableMidiOutputs = [];
      this.activeMidiOutput = null;
      midi.outputs.forEach(output => {
        availableMidiOutputs[output.id] = output;
        if (!this.activeMidiOutput) {
          this.setOutput(output);
        }
      });
      this.setState({
        availableMidiOutputs,
      });
    });
  }

  animate(playerTimeMillis, parsedMidiFile) {
    /*const notes = parsedMidiFile.getNotes(playerTimeMillis, playerTimeMillis);
    const newActiveMidiNotes = new Array(midiConstants.NOTE_COUNT);
    notes.forEach(note => {
      if (!newActiveMidiNotes[note.noteNumber]) {
        this.activeMidiOutput && this.activeMidiOutput.send && this.activeMidiOutput.send([
          midiConstants.NOTE_ON, note.noteNumber, midiConstants.DEFAULT_VELOCITY 
        ]);
        console.log(midiConstants.NOTE_ON, note.noteNumber, midiConstants.DEFAULT_VELOCITY);
      }
      newActiveMidiNotes[note.noteNumber] = true;
    });
    this.activeMidiNotes.filter(note => note).forEach((note,index) => {
      if (!newActiveMidiNotes[index]) {
        this.activeMidiOutput && this.activeMidiOutput.send && this.activeMidiOutput.send([
          midiConstants.NOTE_OFF, index, midiConstants.DEFAULT_VELOCITY 
        ]);   
        console.log(midiConstants.NOTE_OFF, index, midiConstants.DEFAULT_VELOCITY);
      }
    }); 

    this.activeMidiNotes = newActiveMidiNotes;*/
  }

  sendMidiMessage(msg) {
    this.activeMidiOutput && this.activeMidiOutput.send && this.activeMidiOutput.send(msg);
  }

  noteOn(note) {
    this.activeMidiNotes[note.noteNumber] = true;
    this.sendMidiMessage([ midiConstants.NOTE_ON, note.noteNumber, note.velocity ]);
  }

  noteOff(note) {
    this.activeMidiNotes[note.noteNumber] = false;
    this.sendMidiMessage([ midiConstants.NOTE_OFF, note.noteNumber, note.velocity ]);
  }

  setOutput(output) {
    this.activeMidiOutput = output;
    for (let i=0; i < this.activeMidiNotes.length; i++) {
      this.sendMidiMessage([ midiConstants.NOTE_OFF, i, 0 ]);
    }
  }

  handleChangeOutput(evt) {
    this.setOutput(this.state.availableMidiOutputs[evt.target.value]);
  }

  currentMsChanged() {
    for (let i=0; i < this.activeMidiNotes.length; i++) {
      if (this.activeMidiNotes[i]) {
        this.sendMidiMessage([ midiConstants.NOTE_OFF, i, 0 ]);
      }
      this.activeMidiNotes[i] = false;
    }
  }

  render() {
    return (
      <div>
        <span>MIDI output device</span>
        <span>
          <select onChange={this.handleChangeOutput}>
            { Object.values(this.state.availableMidiOutputs).map(output =>
              <option key={output.id} value={output.id}>{output.name}</option>
            ) }
          </select>
        </span>
      </div>
    );
  }
}