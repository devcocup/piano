Piano-score
===========


- Piano score output: Uses Midi Sheet Music (http://midisheetmusic.com/) to parse .mid files and generate sheet music. Compiled from C# to JavaScript using Bridge.NET
- LED strip output: Outputs to a Arduino MIDI device to light up corresponding piano keys. Requires WebMidi support (Chrome browser only)
- MIDI keyboard input: Reads input from a MIDI device. Requires WebMidi support (Chrome browser only)
- Soundfont output: Plays soundfont audio (using https://www.npmjs.com/package/soundfont-player)4