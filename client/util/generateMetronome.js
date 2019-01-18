export default function generateMetronome(
  beatIntervalMs,
  beatsPerMeasure,
  totalTime,
) {
  const measureInterval = beatIntervalMs / beatsPerMeasure;
  const countInterval = totalTime / measureInterval;
  return [...Array(Math.floor(countInterval)).keys()].map(i => {
    return {
      start: !(i % beatsPerMeasure),
      time: i * measureInterval,
    };
  });
}
