import { describe, expect, test } from 'vitest';
import { generateTempReadings } from './temperature';
import { addHours, hoursBetween } from '../lib/dates';

const start = '2026-10-01T00:00:00.000Z';
const hourOf = (t: string) => hoursBetween(start, t);

describe('generateTempReadings', () => {
  test('one reading every 30 min up to end inclusive', () => {
    const r = generateTempReadings({ start, end: addHours(start, 24), seed: 1 });
    expect(r).toHaveLength(49);
    expect(hoursBetween(r[0].t, r[1].t)).toBe(0.5);
  });

  test('is deterministic for the same seed and options', () => {
    const opts = { start, end: addHours(start, 100), seed: 9 };
    expect(generateTempReadings(opts)).toEqual(generateTempReadings(opts));
  });

  test('follows a thermophilic curve', () => {
    const r = generateTempReadings({ start, end: addHours(start, 41 * 24), seed: 2, peak: 60 });
    for (const x of r) {
      const h = hourOf(x.t);
      if (h >= 100 && h <= 400) {
        expect(x.celsius).toBeGreaterThanOrEqual(59);
        expect(x.celsius).toBeLessThanOrEqual(61);
      }
      if (h === 0 || h >= 960) {
        expect(x.celsius).toBeGreaterThanOrEqual(29);
        expect(x.celsius).toBeLessThanOrEqual(31);
      }
    }
  });

  test('peak defaults to 55–65', () => {
    const r = generateTempReadings({ start, end: addHours(start, 400), seed: 5 });
    const plateau = r.filter((x) => hourOf(x.t) >= 100).map((x) => x.celsius);
    const max = Math.max(...plateau);
    expect(max).toBeGreaterThanOrEqual(54);
    expect(max).toBeLessThanOrEqual(66);
  });

  test('gaps omit readings', () => {
    const r = generateTempReadings({ start, end: addHours(start, 24), seed: 3, gaps: [{ fromHour: 10, hours: 3 }] });
    expect(r.some((x) => hourOf(x.t) >= 10 && hourOf(x.t) < 13)).toBe(false);
    expect(r.some((x) => hourOf(x.t) === 13)).toBe(true);
  });

  test('dips override the temperature', () => {
    const r = generateTempReadings({
      start,
      end: addHours(start, 200),
      seed: 4,
      peak: 60,
      dips: [{ fromHour: 100, hours: 6, celsius: 37 }],
    });
    const inDip = r.filter((x) => hourOf(x.t) >= 100 && hourOf(x.t) < 106);
    expect(inDip).toHaveLength(12);
    for (const x of inDip) {
      expect(x.celsius).toBeGreaterThanOrEqual(36);
      expect(x.celsius).toBeLessThanOrEqual(38);
    }
  });
});
