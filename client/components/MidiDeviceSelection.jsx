import React from 'react';
import midiIo from '../util/midiIo';

export default class MidiDeviceSelection extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      availableMidiPorts: [],
    };

    this.init = this.init.bind(this);
    this.changePort = this.changePort.bind(this);

    this.init();
  }

  init() {
    midiIo.registerDevicesChanged(midi => {
      this.setState({
        availableMidiPorts: [
          ...(this.props.input ? midi.inputs : midi.outputs),
        ],
      });
    });
  }

  changePort(evt) {
    const activePort = this.state.availableMidiPorts.find(
      p => p.id === evt.target.value,
    );
    this.props.changePort(evt.target.value, activePort);
  }

  render() {
    return (
      <select
        onChange={this.changePort}
        value={this.props.selectedPortId}
      >
        <option key="" value="">
          {this.state.availableMidiPorts.length
            ? 'No MIDI device selected'
            : 'No MIDI devices found'}
        </option>
        {this.state.availableMidiPorts.map(port => (
          <option key={port.id} value={port.id}>
            {port.name} ({port.manufacturer})
          </option>
        ))}
      </select>
    );
  }
}
