import { describe, expect, test } from 'vitest';
import { loadData, loadRole, ROLE_KEY, saveData, saveRole, STORAGE_KEY } from './storage';
import { buildSampleData, emptyData } from '../data/sampleData';

describe('loadData', () => {
  test('falls back to sample data when nothing is stored', () => {
    expect(loadData()).toEqual(buildSampleData());
  });

  test.each([
    ['bad JSON', '{bad json'],
    ['wrong version', '{"version":2}'],
    ['missing arrays', '{"version":1}'],
    ['null', 'null'],
    ['a null record', '{"version":1,"intakes":[null],"batches":[],"trials":[],"trees":[]}'],
    ['a record without an id', '{"version":1,"intakes":[],"batches":[{"status":"composting"}],"trials":[],"trees":[]}'],
  ])('falls back to sample data for %s', (_, raw) => {
    localStorage.setItem(STORAGE_KEY, raw);
    expect(loadData()).toEqual(buildSampleData());
  });

  test('round-trips saved data', () => {
    saveData(emptyData());
    expect(loadData()).toEqual(emptyData());
  });
});

describe('role storage', () => {
  test('defaults to admin and rejects unknown roles', () => {
    expect(loadRole()).toBe('admin');
    localStorage.setItem(ROLE_KEY, 'hacker');
    expect(loadRole()).toBe('admin');
  });

  test('round-trips a role', () => {
    saveRole('staff');
    expect(loadRole()).toBe('staff');
  });
});
