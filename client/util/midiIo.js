class MidiIo {
  constructor() {
    this.get = this.get.bind(this);
  }

  get() {
    if (this.inputs && this.outputs) {
      return Promise.resolve({ inputs: this.inputs, outputs: this.outputs });
    }

    return this.promise || (this.promise = navigator.requestMIDIAccess({ sysex: true }).then(midi => {
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
      this.promise = null;
      
      return Promise.resolve({ inputs, outputs });
    }));
  }
}

const midiIo = new MidiIo();
export default midiIo;