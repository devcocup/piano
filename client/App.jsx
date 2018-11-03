import React from 'react';
import { connect } from "react-redux";
import PropTypes from 'prop-types';
import Controls from './components/Controls';
import IoModuleForm from './components/IoModuleForm';
import './style/main';
import Player from './PlayerAlt';
import * as IoModules from './iomodules';
import ParsedMidiFile from './util/ParsedMidiFile';
import storage from './util/storage';
import arrayBufferToBase64 from './util/arrayBufferToBase64';
import base64ToArrayBuffer from './util/base64ToArrayBuffer';
import sampleSong from './external/MidiSheetMusic/songs/Beethoven__Moonlight_Sonata.mid';
const SAMPLE_SONG_NAME = 'Beethoven__Moonlight_Sonata.mid';
const MAIN_FILE_NAME = 'main';


class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = { 
      ioModules: [{
        id: 1,
        module: IoModules.SoundfontOutput,
        name: 'SoundfontOutput',
      }, {
        id: 2,
        module: IoModules.MidiKeyboardInput,
        name: 'MidiKeyboardInput',
      }, {
        id: 3,
        module: IoModules.LedStripOutput,
        name: 'LedStripOutput',
      }, {
        id: 4,
        module: IoModules.SheetMusicOutput,
        name: 'SheetMusicOutput',
      }],
      tempo: 0,
    };

    this.handleAddIoModule = this.handleAddIoModule.bind(this);
    this.handleRemoveIoModule = this.handleRemoveIoModule.bind(this);
    this.noteOn = this.noteOn.bind(this);
    this.noteOff = this.noteOff.bind(this);
    this.animate = this.animate.bind(this);
    this.callIoModulesChildMethod = this.callIoModulesChildMethod.bind(this);
    this.handleSetCurrentMs = this.handleSetCurrentMs.bind(this);
    this.loadSample = this.loadSample.bind(this);
    this.readFile = this.readFile.bind(this);
    this.handleSetPlaying = this.handleSetPlaying.bind(this);
    this.handleSaveFileData = this.handleSaveFileData.bind(this);
    this.loadFileData = this.loadFileData.bind(this);
    this.saveData = this.saveData.bind(this);
    this.loadData = this.loadData.bind(this);

    this.ioModuleEvents = {
      noteOn: this.noteOn,
      noteOff: this.noteOff,
    };

    this.player = new Player({
      noteOn: this.noteOn,
      noteOff: this.noteOff,
    });

  }

  componentDidMount() {
    storage.loadGlobalData().then(globalData => {
      this.globalData = globalData || {};

      if (this.globalData.midiArrayBuffer) {
        this.fileLoaded(base64ToArrayBuffer(this.globalData.midiArrayBuffer), 
          this.globalData.midiFileName);
      } else {
        this.loadSample();
      }

      window.requestAnimationFrame(this.animate);

    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.file !== prevProps.file) {
      this.readFile(this.props.file, this.props.file.name);
    }

    if (this.props.tempo !== prevProps.tempo) {
      this.player.setTempo(this.props.tempo);
      const updatedState = { tempo: this.props.tempo };
      this.setState(updatedState);
      this.saveData(updatedState);
    }

    if (this.props.isPlaying !== prevProps.isPlaying) {
      this.handleSetPlaying(null, !this.player.isPlaying());
    }
  }

  loadSample() {
    fetch(sampleSong)
      .then(response => response.blob())
      .then(blob => this.readFile(blob, SAMPLE_SONG_NAME));
  };

  animate(timestamp) {
    window.requestAnimationFrame(this.animate);

    if (this.player && this.parsedMidiFile) {
      this.callIoModulesChildMethod('animate', 
        this.player.getTimeMillis(), this.parsedMidiFile, timestamp);
    }
  }

  handleAddIoModule(ioModuleName) {
    const newIoModule = {
      id: Math.max(...this.state.ioModules.map(ioModule => ioModule.id)) + 1,
      name: ioModuleName,
    };
    this.setState({
      ioModules: [ 
        ...this.state.ioModules, 
        newIoModule,
      ],
      isAddActive: false,
    });
  }

  handleRemoveIoModule(ioModule) {
    const remainder = this.state.ioModules.filter(m => m.id !== ioModule.id);

    this.setState({
      ioModules: remainder,
    });
  }

  callIoModulesChildMethod(method, ...args) {
    Object.values(this.ioModuleForm.ioModuleList.ioModuleInstances).forEach(ioModuleInstance => {
      if (ioModuleInstance && ioModuleInstance[method]) {
        ioModuleInstance[method].apply(ioModuleInstance, args);
      }
    });
  }

  noteOn(note) {
    this.callIoModulesChildMethod('noteOn', note);
  }

  noteOff(note) {
    this.callIoModulesChildMethod('noteOff', note);
  }

  loadFileData(fileName) {
    storage.loadFileData(fileName).then(data => {
      this.fileData = data;
      this.fileData && Object.keys(this.fileData).forEach(key => {
        const module = this.ioModuleForm.ioModuleList.ioModuleInstances[key];
        if (module && module.loadData) {
          module.loadData(this.fileData[key]);
        } else if (key === MAIN_FILE_NAME) {
          this.loadData(this.fileData[key])
        }
      });
    });
  }

  fileLoaded(arrayBuffer, fileName) {
    this.handleSetPlaying(null, false);
    this.player.setCurrentTimeMillis(0);

    this.parsedMidiFile = new ParsedMidiFile(arrayBuffer, fileName);
    this.player.loadParsedMidiFile(this.parsedMidiFile);
    this.setState({
      tempo: this.player.getTempo(),
    });
    this.callIoModulesChildMethod('loadMidiFile', this.parsedMidiFile);

    this.globalData.midiArrayBuffer = arrayBufferToBase64(arrayBuffer);
    this.globalData.midiFileName = fileName;
    storage.saveGlobalData(this.globalData);
    this.loadFileData(fileName);

    this.setState({
      trackName: fileName,
      config: {
        tracks: this.parsedMidiFile.getTracks(),
      }
    });


  }

  readFile(file, fileName) {
    const reader = new FileReader();
    reader.onload = e => {
      this.fileLoaded(e.target.result, fileName);
    };

    reader.readAsArrayBuffer(file);
  }

  handleSetPlaying(ioModule, isPlaying) {
    this.player.setIsPlaying(isPlaying);
    this.setState({
      isPlaying: this.player.isPlaying(),
    });
  }

  handleSetCurrentMs(ioModule, ms) {
    this.player.setCurrentTimeMillis(ms);
    this.callIoModulesChildMethod('currentMsChanged', ms);
  }

  saveData(toMerge) {
    this.handleSaveFileData(MAIN_FILE_NAME, {
      tempo: this.state.tempo,
      ...toMerge,
    });
  }

  loadData(data) {
    this.setState(data);
    this.player.setTempo(data.tempo || 100);
  }

  handleSaveFileData(ioModuleName, data) {
    (this.fileData || (this.fileData = {}))[ioModuleName] = data;
    storage.saveFileData(this.state.trackName, this.fileData);
  }

  render() {
      return (
        <div>
          <Controls />
          <IoModuleForm 
            ioModules={this.state.ioModules}
            removeIoModule={this.handleRemoveIoModule}
            addIoModule={this.handleAddIoModule}
            ref={ ioModuleForm => this.ioModuleForm = ioModuleForm }
            setCurrentMs={this.handleSetCurrentMs}
            setPlaying={this.handleSetPlaying}
            saveData={this.handleSaveFileData}
          />
        </div>
      );
    }
}

App.propTypes = {
  isPlaying: PropTypes.bool,
  tempo: PropTypes.number,
  trackName: PropTypes.string,
  file: PropTypes.object,
};

const mapStateToProps = state => ({
  isPlaying: state.player.isPlaying,
  tempo: state.player.tempo,
  trackName: state.player.trackName,
  file: state.player.file,
});



export default connect(mapStateToProps)(App);