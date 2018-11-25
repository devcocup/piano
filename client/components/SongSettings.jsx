import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { updateTrackDisplay, updateTrackPlay } from '../actions/playerActions';

class SongSettings extends React.Component {
  constructor(props) {
    super(props);

    this.updateTrack = this.updateTrack.bind(this);
    this.updateTrackAll = this.updateTrackAll.bind(this);
    this.updateTrackPlayAndDisplay = this.updateTrackPlayAndDisplay.bind(this);
    this.updateTrackAllPlayAndDisplay = this.updateTrackAllPlayAndDisplay.bind(
      this,
    );
    this.getTracksToUpdate = this.getTracksToUpdate.bind(this);
  }

  updateTrackAllPlayAndDisplay() {
    const updatedValue = !(
      this.getTracksToUpdate('Play').some(t => t.track.play) ||
      this.getTracksToUpdate('Display').some(t => t.track.display)
    );

    this.updateTrackAll('Play', updatedValue)();
    this.updateTrackAll('Display', updatedValue)();
  }

  getTracksToUpdate(propName) {
    return this.props.trackSettings
      .map((track, index) => ({
        track,
        index,
      }))
      .filter(t => propName === 'Play' || t.track.name !== 'Percussion');
  }

  updateTrackAll(propName, value) {
    return () => {
      //don't include Percussion tracks in display by default
      const tracksToUpdate = this.getTracksToUpdate(propName);

      const updatedValue =
        value === undefined
          ? !tracksToUpdate.some(
              t => t.track[propName === 'Display' ? 'display' : 'play'],
            )
          : value;

      this.props[`updateTrack${propName}`](
        tracksToUpdate.map(t => t.index),
        updatedValue,
      );
    };
  }

  updateTrack(trackIndexes, propName) {
    return evt =>
      this.props[`updateTrack${propName}`](trackIndexes, evt.target.checked);
  }

  updateTrackPlayAndDisplay(trackIndex) {
    return () => {
      const newState =
        !this.props.trackSettings[trackIndex].display &&
        !this.props.trackSettings[trackIndex].play;
      this.props.updateTrackPlay(trackIndex, newState);
      this.props.updateTrackDisplay(trackIndex, newState);
    };
  }

  render() {
    return (
      <table className="song-tracks">
        <thead>
          <tr>
            <th>&nbsp;</th>
            <th>
              <button
                type="button"
                onClick={this.updateTrackAll('Display')}
                title="Display/Hide all tracks"
              >
                <i className="material-icons">remove_red_eye</i>
              </button>
            </th>
            <th>
              <button
                type="button"
                onClick={this.updateTrackAll('Play')}
                title="Play/Mute all tracks"
              >
                <i className="material-icons">volume_up</i>
              </button>
            </th>
            <th className="display-play">
              <button
                type="button"
                onClick={this.updateTrackAllPlayAndDisplay}
                title="Toggle all tracks"
              >
                <i className="material-icons top-left-icon">remove_red_eye</i>
                <i className="material-icons slash">remove</i>
                <i className="material-icons bottom-right-icon">volume_up</i>
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {this.props.trackSettings &&
            this.props.trackSettings.map((track, index) => (
              <tr key={index}>
                <td>{track.name}</td>
                <td className="td-checkbox">
                  <input
                    type="checkbox"
                    checked={track.display}
                    onChange={this.updateTrack([index], 'Display')}
                  />
                </td>
                <td className="td-checkbox">
                  <input
                    type="checkbox"
                    checked={track.play}
                    onChange={this.updateTrack([index], 'Play')}
                  />
                </td>
                <td className="td-checkbox">
                  <input
                    type="checkbox"
                    checked={track.play && track.display}
                    onChange={this.updateTrackPlayAndDisplay([index])}
                  />
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    );
  }
}

SongSettings.propTypes = {
  trackSettings: PropTypes.array,
  updateTrackPlay: PropTypes.func,
  updateTrackDisplay: PropTypes.func,
};

const mapStateToProps = state => ({
  trackSettings: state.player.trackSettings,
});

const mapDispatchToProps = dispatch => ({
  updateTrackPlay: (trackIndex, prop, play) =>
    dispatch(updateTrackPlay(trackIndex, prop, play)),
  updateTrackDisplay: (trackIndex, prop, show) =>
    dispatch(updateTrackDisplay(trackIndex, prop, show)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SongSettings);
