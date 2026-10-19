import type { TempReading } from '../types';
import { addHours, hoursBetween } from '../lib/dates';
import { mulberry32, round1 } from '../lib/random';

export const AMBIENT_C = 30;
export const RISE_END_H = 48;
export const PLATEAU_END_H = 432;
export const COOL_END_H = 960;
export const READING_INTERVAL_MIN = 30;

export interface TempOptions {
  start: string;
  end: string;
  seed: number;
  peak?: number;
  dips?: { fromHour: number; hours: number; celsius: number }[];
  gaps?: { fromHour: number; hours: number }[];
}

function baseTemp(h: number, peak: number): number {
  if (h < RISE_END_H) return AMBIENT_C + ((peak - AMBIENT_C) * h) / RISE_END_H;
  if (h < PLATEAU_END_H) return peak;
  if (h < COOL_END_H) return peak - ((peak - AMBIENT_C) * (h - PLATEAU_END_H)) / (COOL_END_H - PLATEAU_END_H);
  return AMBIENT_C;
}

const inWindow = (h: number, w: { fromHour: number; hours: number }) => h >= w.fromHour && h < w.fromHour + w.hours;

export function generateTempReadings(opts: TempOptions): TempReading[] {
  const rng = mulberry32(opts.seed);
  const peak = opts.peak ?? 55 + rng() * 10;
  const totalHours = hoursBetween(opts.start, opts.end);
  const step = READING_INTERVAL_MIN / 60;
  const readings: TempReading[] = [];

  for (let k = 0; k * step <= totalHours; k++) {
    const h = k * step;
    const noise = (rng() - 0.5) * 2;
    if (opts.gaps?.some((g) => inWindow(h, g))) continue;
    const dip = opts.dips?.find((d) => inWindow(h, d));
    const base = dip ? dip.celsius : baseTemp(h, peak);
    readings.push({ t: addHours(opts.start, h), celsius: round1(base + noise) });
  }
  return readings;
}
