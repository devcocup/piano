import React from 'react';

import Soundfont from 'soundfont-player';

export default class SoundFontOutput extends React.Component {
	constructor(props) {
		super(props);

		this.activeNotes = {};

		this.noteOn = this.noteOn.bind(this);
		this.noteOff = this.noteOff.bind(this);
		this.init = this.init.bind(this);

		this.init({soundfont: 'acoustic_grand_piano'});
	}

	init(config) {
		return Soundfont.instrument(new AudioContext(), config.soundfont)
			.then(newInstrument => {
				this.instrument = newInstrument;
			});
	}

	noteOn(note) {
		if (this.instrument) {
			this.activeNotes[note.noteName] = this.instrument.play(note.noteName);
		}
	}

	noteOff(note) {
		if (this.activeNotes[note.noteName]) {
			this.activeNotes[note.noteName].stop();
			this.activeNotes[note.noteName] = null;
		}
	}

	render() {
		return <div></div>;
	}
}