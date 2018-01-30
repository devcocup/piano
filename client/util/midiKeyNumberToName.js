const names = [ "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B" ];

function midiKeyNumberToName(number) {
  const octave = Math.floor(number / 12) - 1;
  const noteIndex = (number % 12);
  return names[noteIndex] + octave;
}

export default midiKeyNumberToName;