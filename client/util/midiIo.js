class MidiIo {
  constructor() {
    this.get = this.get.bind(this);
  }

  get() {
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
      
      return Promise.resolve({ inputs, outputs });
    }));
  }
}

const midiIo = new MidiIo();
export default midiIo;