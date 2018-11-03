import React from 'react';

export default class TrackSettings extends React.Component {
  change(track, prop) {
    return () => {
      this.props.settingsUpdated && this.props.settingsUpdated(track, prop, !track[prop]);
    };
  }

  render() {
    return (
      <div>
        <table>
          <thead>
            <tr>
              <th>Track</th>
              <th>Display</th>
              <th>Play</th>
            </tr>
          </thead>
          <tbody>
            { this.props.trackSettings && this.props.trackSettings.tracks &&
              this.props.trackSettings.tracks.map((track, index) => (
                <tr key={index}>
                  <td>{track.name}</td>
                  <td><input type="checkbox" checked={ track.display } onClick={ this.change(track, 'display') } /></td>
                  <td><input type="checkbox" checked={ track.play } onClick={ this.change(track, 'play') } /></td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    );
  }
}