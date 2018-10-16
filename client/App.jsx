import React from 'react';
import Controls from './components/Controls';
import IoModuleForm from './components/IoModuleForm';
import Config from './components/Config';
import './style/main';
import Player from './PlayerAlt';
import * as IoModules from './iomodules';
import ParsedMidiFile from './util/ParsedMidiFile';
import storage from './util/storage';
import arrayBufferToBase64 from './util/arrayBufferToBase64';
import base64ToArrayBuffer from './util/base64ToArrayBuffer';
import sampleSong from './external/MidiSheetMusic/songs/Beethoven__Moonlight_Sonata.mid';
const SAMPLE_SONG_NAME = 'Beethoven__Moonlight_Sonata.mid';


export default class App extends React.Component {
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

    this.handleLoadFile = this.handleLoadFile.bind(this);
    this.handlePlayPause = this.handlePlayPause.bind(this);
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
    this.handleTempoChanged = this.handleTempoChanged.bind(this);
    this.handleSaveFileData = this.handleSaveFileData.bind(this);
    this.loadFileData = this.loadFileData.bind(this);

    this.ioModuleEvents = {
      noteOn: this.noteOn,
      noteOff: this.noteOff,
    };

    this.player = new Player({
      noteOn: this.noteOn,
      noteOff: this.noteOff,
    });

  }

  componentDidUpdate() {
    /*if (this.state.trackName) {
      storage.save(this.state.trackName, this.userData);
    }*/
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
      Object.keys(this.fileData).forEach(key => {
        const module = this.ioModuleForm.ioModuleList.ioModuleInstances[key];
        if (module && module.loadData) {
          module.loadData(this.fileData[key]);
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
    this.callIoModulesChildMethod('loadMidiFile', arrayBuffer, fileName);

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

  handleLoadFile(evt) {
    const file = evt.target.files[0];
    this.readFile(file, file.name);
  }

  handlePlayPause() {
    this.handleSetPlaying(null, !this.player.isPlaying());
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

  handleTempoChanged(evt) {
    const newTempo = evt.target.value;
    this.player.setTempo(parseInt(newTempo, 10));
    this.setState({ 
      tempo: newTempo 
    });
  }

  handleSaveFileData(ioModule, data) {
    (this.fileData || (this.fileData = {}))[ioModule.name] = data;
    storage.saveFileData(this.state.trackName, this.fileData);
  }

  render() {
      return (
        <div>
          <Controls 
            loadFile={this.handleLoadFile} 
            playPause={this.handlePlayPause}
            isPlaying={this.state.isPlaying}
            tempoChanged={this.handleTempoChanged}
            tempo={this.state.tempo}
            trackName={this.state.trackName}
          />
          <Config 
            key={this.state.config}
            config={this.state.config} />
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