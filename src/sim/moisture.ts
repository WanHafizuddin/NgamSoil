import type { MixPct, MoistureReading } from '../types';
import { addHours, hoursBetween } from '../lib/dates';
import { mulberry32, round1 } from '../lib/random';

const INTERVAL_H = 6;
const WATERING_EVERY_H = 72;
const DRY_FLOOR = 18;

export function generateMoistureReadings(opts: {
  start: string;
  end: string;
  seed: number;
  mixPct: MixPct;
}): MoistureReading[] {
  const rng = mulberry32(opts.seed);
  const top = 38 + opts.mixPct * 0.08;
  const totalHours = hoursBetween(opts.start, opts.end);
  const readings: MoistureReading[] = [];

  for (let h = 0; h <= totalHours; h += INTERVAL_H) {
    const daysSinceWatering = (h % WATERING_EVERY_H) / 24;
    const vwc = Math.max(DRY_FLOOR, top - 4 * daysSinceWatering) + (rng() - 0.5) * 2;
    readings.push({ t: addHours(opts.start, h), vwc: round1(vwc) });
  }
  return readings;
}
