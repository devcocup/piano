import React from 'react';
import midiConstants from '../../util/midiConstants';

export default class LedStripOutput extends React.Component {
	constructor(props) {
		super(props);

		this.init = this.init.bind(this);
		this.noteOn = this.noteOn.bind(this);
		this.noteOff = this.noteOff.bind(this);

		this.state = {
			availableMidiOutputs: [],
		};

		this.activeMidiNotes = new Array(midiConstants.NOTE_COUNT);
		this.init();
	}

	init() {
		navigator.requestMIDIAccess({ sysex: true }).then(midi => {
			const availableMidiOutputs = [];
			this.activeMidiOutput = null;
			midi.outputs.forEach(output => {
				availableMidiOutputs.push({
					id: output.id,
					name: output.name,
				});
				if (!this.activeMidiOutput) {
					this.activeMidiOutput = output;
				}
			});
			this.setState({
				availableMidiOutputs,
			});
		})
	}

	animate(playerTimeMillis, parsedMidiFile) {
		const notes = parsedMidiFile.getNotes(playerTimeMillis, playerTimeMillis);
		const newActiveMidiNotes = new Array(midiConstants.NOTE_COUNT);
		notes.forEach(note => {
			if (!newActiveMidiNotes[note.noteNumber]) {
				this.activeMidiOutput && this.activeMidiOutput.send([
					midiConstants.NOTE_ON, note.noteNumber, midiConstants.DEFAULT_VELOCITY 
				]);
			}
			newActiveMidiNotes[note.noteNumber] = true;
		});
		this.activeMidiNotes.filter(note => note).forEach((note,index) => {
			if (!newActiveMidiNotes[index]) {
				this.activeMidiOutput && this.activeMidiOutput.send([
					midiConstants.NOTE_OFF, index, midiConstants.DEFAULT_VELOCITY 
				]);		
			}
		});	

		this.activeMidiNotes = newActiveMidiNotes;
	}

	noteOn(note) {
		//this.activeMidiNotes[note] = true;
		/*this.activeMidiOutput && this.activeMidiOutput.send([
			midiConstants.NOTE_ON, note.noteNumber, midiConstants.DEFAULT_VELOCITY 
		]);*/
	}

	noteOff(note) {
		/*this.activeMidiNotes[note] = false;
		this.activeMidiOutput && this.activeMidiOutput.send([
			midiConstants.NOTE_OFF, note.noteNumber, midiConstants.DEFAULT_VELOCITY 
		]);*/
	}

	render() {
		return (
			<div>
				<span>Output device</span>
				<span>
					<select>
						{ this.state.availableMidiOutputs && this.state.availableMidiOutputs.map(output=>
							<option key={output.id} value={output.id}>{output.name}</option>
						) }
					</select>
				</span>
			</div>
		);
	}
}