import React from 'react';
import Controls from './components/Controls';
import IoModuleForm from './components/IoModuleForm';
import './style/main';
import Player from './Player';
import * as IoModules from './iomodules';
import ParsedMidiFile from './util/ParsedMidiFile';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    
    this.state = { 
      ioModules: [{
        id: 1,
        module: IoModules.SheetMusicOutput,
        name: 'SheetMusicOutput',
      }, {
        id: 2,
        module: IoModules.LedStripOutput,
        name: 'LedStripOutput',
      }, {
        id: 3,
        module: IoModules.SoundfontOutput,
        name: 'SoundfontOutput',
      }],
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
    window.requestAnimationFrame(this.animate);
  }

  animate(timestamp) {
    window.requestAnimationFrame(this.animate);

    if (this.player && this.parsedMidiFile) {
      this.callIoModulesChildMethod('animate', 
        this.player.getTimeMillis(), this.parsedMidiFile);
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

  fileLoaded(arrayBuffer) {
    this.player.loadMidiArrayBuffer(arrayBuffer);
  }

  handleLoadFile(evt) {
    const file = evt.target.files[0];
    const fileName = file.name;
    const reader = new FileReader();
    reader.onload = e => {
      this.fileLoaded(e.target.result);

      this.parsedMidiFile = new ParsedMidiFile(e.target.result, fileName);
      this.callIoModulesChildMethod('loadMidiFile', e.target.result, fileName);
    };

    reader.readAsArrayBuffer(file);

  }

  handlePlayPause() {
    this.player.togglePlayPause();
    this.setState({
      isPlaying: this.player.isPlaying(),
    });
  }

  handleSetCurrentMs(ioModule, ms) {
    this.player.setCurrentTimeMillis(ms);
  }

  render() {
      return (
        <div>
          <Controls 
            loadFile={this.handleLoadFile} 
            playPause={this.handlePlayPause}
            isPlaying={this.state.isPlaying}
        />
          <IoModuleForm 
            ioModules={this.state.ioModules}
            removeIoModule={this.handleRemoveIoModule}
            addIoModule={this.handleAddIoModule}
            ref={ ioModuleForm => this.ioModuleForm = ioModuleForm }
            setCurrentMs={this.handleSetCurrentMs}
          />
        </div>
      );
    }
}