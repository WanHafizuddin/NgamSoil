import { expect, test } from 'vitest';
import { generateMoistureReadings } from './moisture';
import { addHours, hoursBetween } from '../lib/dates';

const start = '2026-09-07T00:00:00.000Z';
const mean = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;

test('one reading every 6 h', () => {
  const r = generateMoistureReadings({ start, end: addHours(start, 48), seed: 1, mixPct: 0 });
  expect(r).toHaveLength(9);
  expect(hoursBetween(r[0].t, r[1].t)).toBe(6);
});

test('VWC stays in a plausible range', () => {
  const r = generateMoistureReadings({ start, end: addHours(start, 42 * 24), seed: 2, mixPct: 50 });
  for (const x of r) {
    expect(x.vwc).toBeGreaterThanOrEqual(15);
    expect(x.vwc).toBeLessThanOrEqual(50);
  }
});

test('more compost holds more water', () => {
  const end = addHours(start, 42 * 24);
  const low = generateMoistureReadings({ start, end, seed: 3, mixPct: 0 }).map((x) => x.vwc);
  const high = generateMoistureReadings({ start, end, seed: 3, mixPct: 50 }).map((x) => x.vwc);
  expect(mean(high)).toBeGreaterThan(mean(low));
});
