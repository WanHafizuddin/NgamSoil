import { describe, expect, test } from 'vitest';
import { computeGI, isPass } from './gi';

const CONTROL = [38, 42, 40, 41, 39, 40, 43, 37, 40, 40];
const PASS_SAMPLE = [36, 38, 35, 37, 39, 36, 37, 38, 36, 36];
const FAIL_SAMPLE = [30, 34, 31, 33, 32, 29, 35, 32];

const passInput = { seedsSample: 10, seedsControl: 10, rootLengthsSample: PASS_SAMPLE, rootLengthsControl: CONTROL };

describe('computeGI', () => {
  test('passing sample gives GI 92.0', () => {
    expect(computeGI(passInput)).toBeCloseTo(92.0);
  });

  test('recomputes when a root length is edited', () => {
    expect(computeGI({ ...passInput, rootLengthsSample: [4, ...PASS_SAMPLE.slice(1)] })).toBeCloseTo(84.0);
  });

  test('failing sample gives GI 64.0', () => {
    expect(
      computeGI({ seedsSample: 8, seedsControl: 10, rootLengthsSample: FAIL_SAMPLE, rootLengthsControl: CONTROL }),
    ).toBeCloseTo(64.0);
  });

  test('returns null without a valid control', () => {
    expect(computeGI({ ...passInput, seedsControl: 0 })).toBeNull();
    expect(computeGI({ ...passInput, rootLengthsControl: CONTROL.map(() => 0) })).toBeNull();
    expect(computeGI({ ...passInput, rootLengthsControl: [] })).toBeNull();
  });

  test('returns null for negative or non-numeric values', () => {
    expect(computeGI({ ...passInput, rootLengthsSample: [-1, ...PASS_SAMPLE.slice(1)] })).toBeNull();
    expect(computeGI({ ...passInput, rootLengthsSample: [NaN, ...PASS_SAMPLE.slice(1)] })).toBeNull();
    expect(computeGI({ ...passInput, seedsSample: -2 })).toBeNull();
  });

  test('no germinated sample seeds gives 0', () => {
    expect(computeGI({ ...passInput, seedsSample: 0, rootLengthsSample: [] })).toBe(0);
  });
});

describe('isPass', () => {
  test('passes only above 80', () => {
    expect(isPass(80)).toBe(false);
    expect(isPass(80.1)).toBe(true);
    expect(isPass(null)).toBe(false);
  });
});
