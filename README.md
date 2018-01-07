Piano-score
===========

Simple React web app to assist in learning the piano. Reads a MIDI file and displays generated sheet music. Click Play to play the file and highlight played notes. Still very much WIP.

Input and output is handled through React components:
- Piano score output: Uses Midi Sheet Music (http://midisheetmusic.com/) to parse .mid files and generate sheet music. Compiled from C# to JavaScript using Bridge.NET
- LED strip output: Outputs to a Arduino MIDI device to light up corresponding piano keys. Requires WebMidi support (Chrome browser only)
- MIDI keyboard input: Reads input from a MIDI device. Requires WebMidi support (Chrome browser only)
- Soundfont output: Plays soundfont audio (https://www.npmjs.com/package/soundfont-player)