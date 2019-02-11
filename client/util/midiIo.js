class MidiIo {
  constructor() {
    this.registerDevicesChanged = this.registerDevicesChanged.bind(this);
    this.onstatechange = this.onstatechange.bind(this);
    this.callbacks = [];
  }

  onstatechange(evt) {
    const port = evt.port;
    const portArray =
      port.type === 'output'
        ? [...this.outputs]
        : port.type === 'input'
        ? [...this.inputs]
        : null;

    if (!portArray) {
      return;
    }

    if (port.state === 'connected') {
      portArray.push(port);
    } else if (port.state === 'disconnected') {
      const index = portArray.findIndex(p => p.id === port.id);
      if (index >= 0) {
        portArray.splice(index, 1);
      }
    }

    const distinct = portArray.filter((elem, pos, arr) => 
      arr.findIndex(p => p.id === elem.id) === pos
    );
    if (port.type === 'input') {
      this.inputs = distinct;
    } else {
      this.outputs = distinct;
    }
    
    this.callbacks.forEach(callback => callback({ inputs: this.inputs, outputs: this.outputs }));
  }

  registerDevicesChanged(callback) {
    this.callbacks.push(callback);

    if (!this.promise) {
      if (!navigator.requestMIDIAccess) {
        console.warn('This browser doesn\'t support navigator.requestMIDIAccess (try Chrome)');
        return;
      }
      this.promise = navigator.requestMIDIAccess({ sysex: true }).then(midi => {
        const inputs = [];
        midi.inputs.forEach(input => {
          inputs.push(input);
        });

        const outputs = [];
        midi.outputs.forEach(output => {
          outputs.push(output);
        });

        this.inputs = inputs;
        this.outputs = outputs;

        midi.onstatechange = this.onstatechange;

        this.callbacks.forEach(callback => callback({ inputs, outputs }));
      });
    }
  }
}

const midiIo = new MidiIo();
export default midiIo;
