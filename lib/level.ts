/** Level from total points: gentle curve so early wins feel fast. */
export function levelFromPoints(totalPoints: number): number {
  const p = Math.max(0, totalPoints);
  return Math.floor(Math.pow(p / 100, 0.55)) + 1;
}

export function xpProgress(totalPoints: number): {
  level: number;
  currentBandStart: number;
  nextBandStart: number;
  inBand: number;
} {
  const level = levelFromPoints(totalPoints);
  const currentBandStart = Math.pow(level - 1, 1 / 0.55) * 100;
  const nextBandStart = Math.pow(level, 1 / 0.55) * 100;
  const span = Math.max(1, nextBandStart - currentBandStart);
  const inBand = Math.min(1, Math.max(0, (totalPoints - currentBandStart) / span));
  return { level, currentBandStart, nextBandStart, inBand };
}
