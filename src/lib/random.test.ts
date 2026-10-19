import { describe, expect, test } from 'vitest';
import { hashString, mulberry32, pick, randInt, round1 } from './random';

describe('mulberry32', () => {
  test('same seed gives the same sequence', () => {
    expect(Array.from({ length: 5 }, mulberry32(42))).toEqual(Array.from({ length: 5 }, mulberry32(42)));
  });

  test('values are in [0, 1)', () => {
    const rng = mulberry32(7);
    for (let i = 0; i < 500; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('hashString', () => {
  test('is stable and distinguishes inputs', () => {
    expect(hashString('RL-B-2026-001')).toBe(hashString('RL-B-2026-001'));
    expect(hashString('a')).not.toBe(hashString('b'));
    expect(hashString('a')).toBeGreaterThanOrEqual(0);
  });
});

describe('randInt', () => {
  test('stays inside the inclusive range and hits both ends', () => {
    const rng = mulberry32(1);
    const seen = new Set<number>();
    for (let i = 0; i < 200; i++) {
      const v = randInt(rng, 3, 5);
      expect(v).toBeGreaterThanOrEqual(3);
      expect(v).toBeLessThanOrEqual(5);
      seen.add(v);
    }
    expect(seen).toEqual(new Set([3, 4, 5]));
  });
});

test('pick returns an item from the list', () => {
  const rng = mulberry32(3);
  expect(['x', 'y', 'z']).toContain(pick(rng, ['x', 'y', 'z']));
});

test('round1 rounds to one decimal place', () => {
  expect(round1(36.84)).toBe(36.8);
  expect(round1(92.00000000000001)).toBe(92);
});
