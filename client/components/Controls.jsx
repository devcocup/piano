import React from 'react';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faPlay, faPause } from '@fortawesome/fontawesome-free-solid';
import TrackSettings from './TrackSettings';

import '../style/controls';

export default class Controls extends React.Component {
  constructor(props) {
    super(props);

    this.state = { showSettings: false };
    this.handleLoad = this.handleLoad.bind(this);
    this.handleSettingsClick = this.handleSettingsClick.bind(this);
  }

  handleLoad() {
    this.midiFileInput.click();
  }

  handleSettingsClick(evt) {
    evt.stopPropagation();
    this.setState({ showSettings: !this.state.showSettings })
  }

  render() {
    return (
      <div className="controls">
        <div className="piano-content">
          <span className="track-name-container" onClick={ this.handleLoad }>
            <span className="track-name">{ this.props.trackName }</span>
            <span className="track-name-icon">
              <FontAwesomeIcon icon="upload" />
            </span>
            <input 
              type="file" 
              ref={input => this.midiFileInput = input} 
              style={ {display: 'none'} } 
              onChange={ this.props.loadFile } 
              accept=".mid"
            />
            <button type="button" className="track-name-icon" onClick={ this.handleSettingsClick }>
              <FontAwesomeIcon icon="cogs" />
            </button>
          </span>
          <div className={this.state.showSettings ? '' : 'hidden'}>
            <TrackSettings
              trackSettings={ this.props.trackSettings }
              settingsUpdated={ this.props.settingsUpdated }
            />
          </div>
          <div>
            <button type="button" onClick={ this.props.playPause }>
              <FontAwesomeIcon icon={ this.props.isPlaying ? faPause : faPlay} />
            </button>
            <label>
              <span className="label">Tempo</span>
              <input 
                type="number"
                value={ this.props.tempo }
                onChange={ this.props.tempoChanged }
                className="tempo"
                step="10"
                min="0"
                max="1000" />
            </label>
          </div>
        </div>
      </div>
    );
  }
}