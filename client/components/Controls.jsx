import React from 'react';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faPlay, faPause } from '@fortawesome/fontawesome-free-solid';

import '../style/controls';

export default class Controls extends React.Component {
  constructor(props) {
    super(props);

    this.load = this.load.bind(this);
  }

  load() {
    this.midiFileInput.click();
  }

  render() {
    return (
      <div className="controls">
        <div className="piano-content">
          <button type="button" onClick={this.props.playPause}>
            <FontAwesomeIcon icon={ this.props.isPlaying ? faPause : faPlay} />
          </button>
          <button type="button" onClick={this.load}>Load MIDI track...</button>
          <input 
            type="file" 
            ref={input => this.midiFileInput = input} 
            style={{display: 'none'}} 
            onChange={this.props.loadFile} 
            accept=".mid"
          />
        </div>
      </div>
    );
  }
}