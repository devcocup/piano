import React from 'react';

export default class Config extends React.Component {
  constructor(props) {
    super(props);

    this.state = { ...props.config };

    this.handleTrackToggle = this.handleTrackToggle.bind(this);
  }

  handleTrackToggle(track, prop) {
    return evt => {
      const index = this.state.tracks.indexOf(track);
      const toUpdate = { ...this.state.tracks[index] };
      toUpdate[prop] = event.target.checked;
      const tracks = [ ...this.state.tracks ];
      tracks[index] = toUpdate;
      this.setState({tracks});
    }
  }

  render() {
    return (
      //disable for now
      <table style={{display: 'none'}}> 
        <thead>
          <tr>
            <th>Track</th>
            <th>Play</th>
            <th>Display</th>
          </tr>
        </thead>
        <tbody>
        { this.state.tracks && this.state.tracks.map((track, i) => 
          <tr key={i}>
            <td>{track.name}</td>
            <td><input type="checkbox" checked={track.shouldPlay} onChange={this.handleTrackToggle(track, 'shouldPlay')} /></td>
            <td><input type="checkbox" checked={track.shouldDisplay} onChange={this.handleTrackToggle(track, 'shouldDisplay')}/></td>
          </tr>)}  
        </tbody>
      </table>
    );
  }
}