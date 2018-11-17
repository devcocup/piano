import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { updateTrackDisplay, updateTrackPlay } from '../actions/pianoActions';

class SongSettings extends React.Component {
  constructor(props) {
    super(props);

    this.updateTrackDisplay = this.updateTrackDisplay.bind(this);
    this.updateTrackPlay = this.updateTrackPlay.bind(this);
  }

  updateTrackDisplay(trackIndex) {
    return evt => this.props.updateTrackDisplay(trackIndex, evt.target.checked);
  }

  updateTrackPlay(trackIndex) {
    return evt => this.props.updateTrackPlay(trackIndex, evt.target.checked);
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
            this.props.trackSettings.map((track, index) => (
              <tr key={index}>
                <td>{track.name}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={track.display}
                    onChange={this.updateTrackDisplay(index)}
                  />
                </td>
                <td>
                  <input
                    type="checkbox"
                    checked={track.play}
                    onChange={this.updateTrackPlay(index)}
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
  trackSettings: state.trackSettings,
});

const mapDispatchToProps = dispatch => ({
  updateTrackPlay: (trackIndex, prop, play) => dispatch(updateTrackPlay(trackIndex, prop, play)),
  updateTrackDisplay: (trackIndex, prop, show) => dispatch(updateTrackDisplay(trackIndex, prop, show))
});

export default connect(mapStateToProps, mapDispatchToProps)(SongSettings);
