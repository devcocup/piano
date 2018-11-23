import React from 'react';
import midiConstants from '../../../util/midiConstants';
import MidiDeviceSelection from '../../MidiDeviceSelection';

export default class LedStripOutput extends React.Component {
  constructor(props) {
    super(props);

    this.handleChangePort = this.handleChangePort.bind(this);
    this.noteOn = this.noteOn.bind(this);
    this.noteOff = this.noteOff.bind(this);
    this.sendMidiMessage = this.sendMidiMessage.bind(this);

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

  noteOn(note) {
    if (!this.activeMidiNotes[note.noteNumber].size) {
      this.sendMidiMessage([
        midiConstants.NOTE_ON + note.channel,
        note.noteNumber,
        note.velocity,
      ]);
    }
    this.activeMidiNotes[note.noteNumber].add(note.staff);
  }

  noteOff(note) {
    this.activeMidiNotes[note.noteNumber].delete(note.staff);
    if (!this.activeMidiNotes[note.noteNumber].size) {
      this.sendMidiMessage([
        midiConstants.NOTE_OFF + note.channel,
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
