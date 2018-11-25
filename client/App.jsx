import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import Controls from "./components/Controls";
import IoModuleForm from "./components/IoModuleForm";
import Player from "./util/Player";
import * as IoModules from "./components/iomodules";
import { setTempo } from "./actions/playerActions";
import { loadGlobalData } from "./actions/pianoActions";

import "./style/main";

class App extends React.Component {
  constructor(props) {
    super(props);

    this.noteOn = this.noteOn.bind(this);
    this.noteOff = this.noteOff.bind(this);
    this.animate = this.animate.bind(this);
    this.callIoModulesChildMethod = this.callIoModulesChildMethod.bind(this);
    this.handleSetCurrentMs = this.handleSetCurrentMs.bind(this);
    this.setPlaying = this.setPlaying.bind(this);
    this.setTempo = this.setTempo.bind(this);
    this.setIoModuleInstance = this.setIoModuleInstance.bind(this);
    this.handleNoteOnUserInput = this.handleNoteOnUserInput.bind(this);
    this.handleNoteOffUserInput = this.handleNoteOffUserInput.bind(this);

    this.ioModuleInstances = [];

    this.player = new Player({
      noteOn: this.noteOn,
      noteOff: this.noteOff,
    });

    this.state = {
      ioModules: [
        IoModules.SoundfontOutput,
        IoModules.MidiKeyboardInput,
        IoModules.LedStripOutput,
        IoModules.SheetMusicOutput,
      ],
    };

    this.ioModuleCallbacks = {
      setCurrentMs: this.handleSetCurrentMs,
      noteOnUserInput: this.handleNoteOnUserInput,
      noteOffUserInput: this.handleNoteOffUserInput
    };
  }

  componentDidMount() {
    this.props.loadGlobalData();
    window.requestAnimationFrame(this.animate);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.tempo !== prevProps.tempo) {
      this.setTempo(this.props.tempo);
    }

    if (this.props.isPlaying !== prevProps.isPlaying) {
      this.setPlaying(null, this.props.isPlaying);
    }

    if (this.props.parsedMidiFile !== prevProps.parsedMidiFile) {
      this.fileLoaded(this.props.parsedMidiFile);
    }
  }

  setTempo(tempo) {
    this.player.setTempo(tempo);
  }

  animate(timestamp) {
    window.requestAnimationFrame(this.animate);

    if (this.player && this.props.parsedMidiFile) {
      this.callIoModulesChildMethod(
        "animate",
        this.player.getTimeMillis(),
        timestamp,
      );
    }
  }

  callIoModulesChildMethod(method, ...args) {
    this.ioModuleInstances.forEach(ioModuleInstance => {
      if (ioModuleInstance && ioModuleInstance[method]) {
        ioModuleInstance[method].apply(ioModuleInstance, args);
      }
    });
  }

  noteOn(note) {
    this.callIoModulesChildMethod("onNoteOn", note);
  }

  noteOff(note) {
    this.callIoModulesChildMethod("onNoteOff", note);
  }

  handleNoteOnUserInput(note) {
    this.callIoModulesChildMethod("onNoteOnUserInput", note);
  }

  handleNoteOffUserInput(note) {
    this.callIoModulesChildMethod("onNoteOffUserInput", note);
  }

  fileLoaded(parsedMidiFile) {
    this.setPlaying(null, false);
    this.player.setCurrentTimeMillis(0);
    this.player.loadParsedMidiFile(parsedMidiFile);
  }

  setPlaying(ioModule, isPlaying) {
    this.player.setIsPlaying(isPlaying);
  }

  handleSetCurrentMs(ms) {
    this.player.setCurrentTimeMillis(ms);
    this.callIoModulesChildMethod("currentMsChanged", ms);
  }

  setIoModuleInstance(index, instance) {
    this.ioModuleInstances[index] = instance;
  }

  render() {
    return (
      <div>
        <Controls />
        <IoModuleForm
          ioModules={this.state.ioModules}
          setIoModuleInstance={this.setIoModuleInstance}
          ioModuleCallbacks={this.ioModuleCallbacks}
        />
      </div>
    );
  }
}

App.propTypes = {
  isPlaying: PropTypes.bool,
  tempo: PropTypes.number,
  midiFileName: PropTypes.string,
  parsedMidiFile: PropTypes.object,
  setTempo: PropTypes.func,
  loadGlobalData: PropTypes.func,
};

const mapStateToProps = state => ({
  isPlaying: state.player.isPlaying,
  tempo: state.player.tempo,
  midiFileName: state.midiFileName,
  parsedMidiFile: state.parsedMidiFile,
});

const mapDispatchToProps = dispatch => ({
  setTempo: tempo => dispatch(setTempo(tempo)),
  loadGlobalData: () => dispatch(loadGlobalData()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(App);
