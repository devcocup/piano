Piano-web
===========

Simple React web app to assist (me) in learning the piano. Reads a MIDI file and displays generated sheet music. Click Play to play the file and highlight notes. Still very much WIP.

See it running here: http://ec2-34-197-21-54.compute-1.amazonaws.com/.

Input and output is handled through React components:
- Piano sheet music output: Uses Midi Sheet Music (http://midisheetmusic.com/) to parse .mid files and generate sheet music. Compiled from C# to JavaScript using Bridge.NET
- LED strip output: Outputs to a Arduino MIDI device to light up corresponding piano keys (https://github.com/djiaak/arduino-led-midi). Requires WebMIDI support (Chrome browser only)
- MIDI keyboard input: Reads input from a MIDI device. Requires WebMIDI support (Chrome browser only)
- Soundfont output: Plays soundfont audio (https://www.npmjs.com/package/soundfont-player)