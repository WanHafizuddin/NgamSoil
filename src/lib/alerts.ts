import type { Batch } from '../types';
import { hoursBetween } from './dates';
import { round1 } from './random';

export type AlertKind = 'too_cold' | 'too_hot' | 'sensor_offline';

export interface Alert {
  id: string;
  batchId: string;
  kind: AlertKind;
  at: string;
  message: string;
}

export const TOO_COLD_C = 40;
export const TOO_HOT_C = 70;
export const OFFLINE_GAP_H = 2;
export const ACTIVE_START_H = 48;
export const ACTIVE_END_H = 432;

interface Run {
  at: string;
  extreme: number;
}

export function detectAlerts(batch: Batch): Alert[] {
  const readings = batch.tempReadings;
  if (readings.length < 2) return [];

  const found: Omit<Alert, 'id' | 'batchId'>[] = [];
  const first = readings[0].t;
  let cold: Run | null = null;
  let hot: Run | null = null;

  const closeCold = () => {
    if (cold) found.push({ kind: 'too_cold', at: cold.at, message: `Too cold: ${cold.extreme.toFixed(1)}°C during the active phase` });
    cold = null;
  };
  const closeHot = () => {
    if (hot) found.push({ kind: 'too_hot', at: hot.at, message: `Too hot: ${hot.extreme.toFixed(1)}°C` });
    hot = null;
  };

  readings.forEach((r, i) => {
    if (i > 0) {
      const gap = hoursBetween(readings[i - 1].t, r.t);
      if (gap > OFFLINE_GAP_H) {
        found.push({ kind: 'sensor_offline', at: readings[i - 1].t, message: `Sensor offline for ${round1(gap)} h` });
      }
    }

    const h = hoursBetween(first, r.t);
    const isCold = h >= ACTIVE_START_H && h < ACTIVE_END_H && r.celsius < TOO_COLD_C;
    if (isCold) cold = cold ? { at: cold.at, extreme: Math.min(cold.extreme, r.celsius) } : { at: r.t, extreme: r.celsius };
    else closeCold();

    if (r.celsius > TOO_HOT_C) hot = hot ? { at: hot.at, extreme: Math.max(hot.extreme, r.celsius) } : { at: r.t, extreme: r.celsius };
    else closeHot();
  });
  closeCold();
  closeHot();

  const counters: Record<string, number> = {};
  return found
    .sort((a, b) => a.at.localeCompare(b.at))
    .map((a) => {
      counters[a.kind] = (counters[a.kind] ?? 0) + 1;
      return { ...a, id: `${batch.id}-${a.kind}-${counters[a.kind]}`, batchId: batch.id };
    });
}

export function activeAlerts(batches: Batch[]): Alert[] {
  return batches
    .filter((b) => b.status === 'composting')
    .flatMap(detectAlerts)
    .sort((a, b) => a.at.localeCompare(b.at));
}
