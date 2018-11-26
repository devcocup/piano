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
      const availableMidiPorts = [
        ...(this.props.input ? midi.inputs : midi.outputs),
      ];
      this.setState({
        availableMidiPorts,
      });

      const selectedMidiPort = availableMidiPorts
        .find(port => port.id === this.props.selectedPortId); 
      if (selectedMidiPort) {
        this.changePort(this.props.selectedPortId, false);
      } else {
        this.changePort('', false);
      }
    });
  }

  changePort(id, setByUser) {
    const activePort = this.state.availableMidiPorts.find(
      p => p.id === id,
    );
    this.props.changePort(id, activePort, setByUser);
  }

  render() {
    return (
      <select
        onChange={evt => this.changePort(evt.target.value, true)}
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
