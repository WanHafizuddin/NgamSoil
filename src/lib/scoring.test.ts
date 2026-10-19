import { describe, expect, test } from 'vitest';
import { recommendForSpecies, scoreTrays } from './scoring';
import type { MixPct, Tray, Trial } from '../types';

let n = 0;
function tray(mixPct: MixPct, growth: number, leaf: number, aliveEnd: number): Tray {
  return {
    id: `T${n++}`,
    mixPct,
    moisture: [],
    logs: [],
    weekly: [
      { week: 0, heightCm: 10, leafHealth: leaf, alive: 12 },
      { week: 6, heightCm: 10 + growth, leafHealth: leaf, alive: aliveEnd },
    ],
  };
}

const weekZeroOnly = (mixPct: MixPct): Tray => ({ ...tray(mixPct, 0, 80, 12), weekly: [tray(mixPct, 0, 80, 12).weekly[0]] });

describe('scoreTrays', () => {
  test('weights height 50%, leaf health 30%, survival 20%', () => {
    const r = scoreTrays([tray(0, 10, 80, 12), tray(25, 5, 90, 12)]);
    expect(r.map((m) => m.mixPct)).toEqual([0, 25]);
    expect(r[0].score).toBeCloseTo(94.0);
    expect(r[1].score).toBeCloseTo(72.0);
  });

  test('survival lowers the score', () => {
    expect(scoreTrays([tray(50, 10, 80, 6)])[0].score).toBeCloseTo(84.0);
  });

  test('ties go to the lower mix', () => {
    expect(scoreTrays([tray(50, 10, 80, 12), tray(25, 10, 80, 12)]).map((m) => m.mixPct)).toEqual([25, 50]);
  });

  test('skips trays with only the week-0 record', () => {
    expect(scoreTrays([weekZeroOnly(0), tray(25, 5, 90, 12)]).map((m) => m.mixPct)).toEqual([25]);
    expect(scoreTrays([weekZeroOnly(0), weekZeroOnly(25)])).toEqual([]);
  });

  test('zero growth everywhere still gives finite scores', () => {
    for (const m of scoreTrays([tray(0, 0, 80, 12), tray(25, 0, 70, 0)])) {
      expect(Number.isFinite(m.score)).toBe(true);
    }
  });

  test('averages trays of the same mix', () => {
    const [m] = scoreTrays([tray(25, 10, 80, 12), tray(25, 6, 70, 12)]);
    expect(m.trayCount).toBe(2);
    expect(m.heightGrowthCm).toBeCloseTo(8);
    expect(m.avgLeafHealth).toBeCloseTo(75);
  });
});

describe('recommendForSpecies', () => {
  const trial = (trays: Tray[]): Trial => ({ id: 'RL-TR-009', species: 'tembusu', batchId: 'B', startDate: '2026-09-07', trays });

  test('returns null when the species has no trials', () => {
    expect(recommendForSpecies([trial([tray(25, 5, 90, 12)])], 'meranti')).toBeNull();
  });

  test('builds the reason for the best mix', () => {
    const rec = recommendForSpecies([trial([tray(0, 8.4, 72, 10), tray(25, 12.6, 85, 12), tray(50, 10.2, 78, 11)])], 'tembusu')!;
    expect(rec.best.mixPct).toBe(25);
    expect(rec.trayCount).toBe(3);
    expect(rec.weekCount).toBe(6);
    expect(rec.trialCount).toBe(1);
    expect(rec.reason).toBe(
      '25% compost grew 12.6 cm in 6 weeks with leaf health 85/100 and 100% survival, vs 8.4 cm for the 0% control.',
    );
  });

  test('ends the reason with a full stop when the control wins', () => {
    const rec = recommendForSpecies([trial([tray(0, 12, 85, 12), tray(25, 6, 70, 12)])], 'tembusu')!;
    expect(rec.reason).toBe('0% compost grew 12.0 cm in 6 weeks with leaf health 85/100 and 100% survival.');
  });
});
