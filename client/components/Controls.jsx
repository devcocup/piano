import React from 'react';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faPlay, faPause } from '@fortawesome/fontawesome-free-solid';
import SongSettings from './SongSettings';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { play, pause, setTempo } from '../actions/playerActions';
import { loadFile } from '../actions/pianoActions';

import '../style/controls';

class Controls extends React.Component {
  constructor(props) {
    super(props);

    this.state = { showSettings: false };
    this.handleLoadClick = this.handleLoadClick.bind(this);
    this.handleLoadFile = this.handleLoadFile.bind(this);
    this.handleSettingsClick = this.handleSettingsClick.bind(this);
    this.handlePlayPauseClick = this.handlePlayPauseClick.bind(this);
    this.handleTempoChange = this.handleTempoChange.bind(this);
  }

  handleLoadClick() {
    this.midiFileInput.click();
  }

  handleLoadFile(evt) {
    this.props.loadFile(evt.target.files[0]);
  }

  handleSettingsClick(evt) {
    evt.stopPropagation();
    this.setState({ showSettings: !this.state.showSettings })
  }

  handlePlayPauseClick() {
    this.props.isPlaying 
      ? this.props.pause()
      : this.props.play();
  }

  handleTempoChange(evt) {
    this.props.setTempo(parseInt(evt.target.value, 10));
  }

  render() {
    return (
      <div className="controls">
        <div className="piano-content">
          <span className="track-name-container" onClick={ this.handleLoadClick }>
            <span className="track-name">{ this.props.midiFileName }</span>
            <span className="track-name-icon">
              <FontAwesomeIcon icon="upload" />
            </span>
            <input 
              type="file" 
              ref={input => this.midiFileInput = input} 
              style={ {display: 'none'} } 
              onChange={ this.handleLoadFile } 
              accept=".mid"
            />
            <button type="button" className="track-name-icon" onClick={ this.handleSettingsClick }>
              <FontAwesomeIcon icon="cogs" />
            </button>
          </span>
          <div className={this.state.showSettings ? '' : 'hidden'}>
            <SongSettings />
          </div>
          <div>
            <button type="button" onClick={ this.handlePlayPauseClick }>
              <FontAwesomeIcon icon={ this.props.isPlaying ? faPause : faPlay} />
            </button>
            <label>
              <span className="label">Tempo</span>
              <input 
                type="number"
                value={ this.props.tempo }
                onChange={ this.handleTempoChange }
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

Controls.propTypes = {
  isPlaying: PropTypes.bool,
  tempo: PropTypes.number,
  midiFileName: PropTypes.string,
};

const mapStateToProps = state => ({
  isPlaying: state.player.isPlaying,
  tempo: state.player.tempo,
  midiFileName: state.midiFileName,
});

const mapDispatchToProps = dispatch => ({
  play: () => dispatch(play()),
  pause: () => dispatch(pause()),
  setTempo: tempo => dispatch(setTempo(tempo)),
  loadFile: file => dispatch(loadFile(file))
});

export default connect(mapStateToProps, mapDispatchToProps)(Controls);
