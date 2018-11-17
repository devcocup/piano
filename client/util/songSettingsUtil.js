import bridgeListToIterable from './bridgeListToIterable';

class SongSettingsUtil {
  loadTrackSettingsFromParsedMidiFile(parsedMidiFile) {
    const midiOptions = parsedMidiFile.getMidiOptions();
    return Array.from(
      bridgeListToIterable(parsedMidiFile.getMidiFile().Tracks),
    ).map((track, i) => ({
      name: track.InstrumentName,
      display: midiOptions.tracks[i],
      play: true,
    }));
  }
}

const songSettingsUtil = new SongSettingsUtil();
export default songSettingsUtil;
