import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

class SongSettings extends React.Component {
  constructor(props) {
    super(props);

    this.updateTrackDisplay = this.updateTrackDisplay.bind(this);
    this.updateTrackPlay = this.updateTrackPlay.bind(this);
  }

  updateTrackDisplay(track) {
    return evt => this.props.updateTrackDisplay(track, evt.target.checked);
  }

  updateTrackPlay(track) {
    return evt => this.props.updateTrackPlay(track, evt.target.checked);
  }

  render() {
    return (
      <table>
        <thead>
          <tr>
            <th>Track</th>
            <th>Display</th>
            <th>Play</th>
          </tr>
        </thead>
        <tbody>
          {this.props.trackSettings &&
            this.props.trackSettings.tracks &&
            this.props.trackSettings.tracks.map((track, index) => (
              <tr key={index}>
                <td>{track.name}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={track.display}
                    onClick={this.updateTrackDisplay(track)}
                  />
                </td>
                <td>
                  <input
                    type="checkbox"
                    checked={track.play}
                    onClick={this.updateTrackPlay(track)}
                  />
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    );
  }
}

SongSettings.propTypes = {};

const mapStateToProps = state => ({
  trackSettings: state.player.trackSettings,
});

const mapDispatchToProps = dispatch => ({
  updateTrackPlay: (track, prop, play) => dispatch(updateTrackPlay(track, prop, play)),
  updateTrackDisplay: (track, prop, show) => dispatch(updateTrackDisplay(track, prop, show))
});

export default connect(mapStateToProps, mapDispatchToProps)(SongSettings);
