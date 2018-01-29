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
          <div className="track-name-container" onClick={ this.load }>
            <span className="track-name">{ this.props.trackName }</span>
            <button type="button">
              <FontAwesomeIcon icon="upload" />
            </button>
            <input 
              type="file" 
              ref={input => this.midiFileInput = input} 
              style={ {display: 'none'} } 
              onChange={ this.props.loadFile } 
              accept=".mid"
            />
          </div>
          <div>
            <button type="button" onClick={ this.props.playPause }>
              <FontAwesomeIcon icon={ this.props.isPlaying ? faPause : faPlay} />
            </button>
            <label>
              <span className="label">Tempo</span>
              <input type="number" value={ this.props.tempo } onChange={ this.props.tempoChanged } className="tempo" />
            </label>
          </div>
        </div>
      </div>
    );
  }
}