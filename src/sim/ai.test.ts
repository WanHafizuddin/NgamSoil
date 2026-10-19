import { describe, expect, test } from 'vitest';
import { simulateGerminationAnalysis, simulateSeedlingAnalysis } from './ai';

describe('simulateGerminationAnalysis', () => {
  test('is deterministic per seed', () => {
    expect(simulateGerminationAnalysis(11)).toEqual(simulateGerminationAnalysis(11));
  });

  test('returns consistent counts and lengths', () => {
    for (const seed of [1, 2, 3, 4, 5]) {
      const r = simulateGerminationAnalysis(seed);
      expect(r.seedsControl).toBe(10);
      expect(r.seedsSample).toBeGreaterThanOrEqual(8);
      expect(r.seedsSample).toBeLessThanOrEqual(10);
      expect(r.rootLengthsSample).toHaveLength(r.seedsSample);
      expect(r.rootLengthsControl).toHaveLength(10);
      for (const v of r.rootLengthsControl) expect(v).toBeGreaterThanOrEqual(36);
      for (const v of r.rootLengthsSample) expect(v).toBeLessThanOrEqual(44);
    }
  });
});

describe('simulateSeedlingAnalysis', () => {
  test('grows by the species profile rate', () => {
    const r = simulateSeedlingAnalysis({ species: 'tembusu', mixPct: 25, prevHeightCm: 20, seed: 7 });
    expect(r.heightCm).toBeGreaterThanOrEqual(22.0);
    expect(r.heightCm).toBeLessThanOrEqual(22.2);
    expect(r.leafHealth).toBeGreaterThanOrEqual(84);
    expect(r.leafHealth).toBeLessThanOrEqual(86);
  });
});
