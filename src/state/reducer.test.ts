import { describe, expect, test } from 'vitest';
import { reducer } from './reducer';
import { buildSampleData, emptyData } from '../data/sampleData';
import type { Intake, TestResult } from '../types';

const sample = () => buildSampleData();
const now = '2026-10-19T02:00:00.000Z';

describe('reducer', () => {
  test('reset and clear', () => {
    expect(reducer(sample(), { type: 'clear' })).toEqual(emptyData());
    expect(reducer(emptyData(), { type: 'reset' })).toEqual(buildSampleData());
  });

  test('addIntake appends', () => {
    const intake: Intake = {
      id: 'RL-I-0023',
      date: '2026-10-19',
      source: 'Landscape team',
      material: 'grass',
      weightKg: 25,
      collector: 'Aiman',
    };
    expect(reducer(sample(), { type: 'addIntake', intake }).intakes.at(-1)).toEqual(intake);
  });

  test('createBatch links unbatched intakes and simulates readings', () => {
    const next = reducer(sample(), { type: 'createBatch', id: 'RL-B-2026-005', intakeIds: ['RL-I-0021', 'RL-I-0022'], now });
    const batch = next.batches.at(-1)!;
    expect(batch).toMatchObject({ id: 'RL-B-2026-005', status: 'composting', createdAt: now, intakeIds: ['RL-I-0021', 'RL-I-0022'] });
    expect(batch.tempReadings.length).toBeGreaterThan(100);
    expect(batch.tempReadings[0].t).toBe('2026-10-12T00:00:00.000Z');
    expect(next.intakes.filter((i) => i.batchId === 'RL-B-2026-005').map((i) => i.id)).toEqual(['RL-I-0021', 'RL-I-0022']);
  });

  test('createBatch ignores already-batched intakes', () => {
    const state = sample();
    expect(reducer(state, { type: 'createBatch', id: 'RL-B-2026-005', intakeIds: ['RL-I-0001'], now })).toBe(state);
  });

  test('createBatch caps readings at 60 days', () => {
    const state = sample();
    const late = '2027-03-01T00:00:00.000Z';
    const batch = reducer(state, { type: 'createBatch', id: 'RL-B-2027-001', intakeIds: ['RL-I-0014'], now: late }).batches.at(-1)!;
    expect(batch.tempReadings[0].t).toBe('2026-12-31T00:00:00.000Z');
  });

  test('markReadyForTest only from composting', () => {
    const state = sample();
    expect(reducer(state, { type: 'markReadyForTest', batchId: 'RL-B-2026-004' }).batches[3].status).toBe('ready_for_test');
    expect(reducer(state, { type: 'markReadyForTest', batchId: 'RL-B-2026-002' })).toBe(state);
  });

  test('saveTestResult sets the result and status', () => {
    const result: TestResult = {
      date: now,
      seedsSample: 10,
      seedsControl: 10,
      rootLengthsSample: [40],
      rootLengthsControl: [40],
      gi: 100,
      passed: true,
    };
    const next = reducer(sample(), { type: 'saveTestResult', batchId: 'RL-B-2026-003', result });
    expect(next.batches[2]).toMatchObject({ status: 'passed', testResult: result });
    const state = sample();
    expect(reducer(state, { type: 'saveTestResult', batchId: 'RL-B-2026-004', result })).toBe(state);
  });

  test('createTrial makes 3 trays and sends the batch to the nursery', () => {
    const next = reducer(sample(), { type: 'createTrial', id: 'RL-TR-003', species: 'angsana', batchId: 'RL-B-2026-001', now });
    const trial = next.trials.at(-1)!;
    expect(trial).toMatchObject({ id: 'RL-TR-003', species: 'angsana', batchId: 'RL-B-2026-001', startDate: '2026-10-19' });
    expect(trial.trays.map((t) => t.id)).toEqual(['RL-TR-003-M0', 'RL-TR-003-M25', 'RL-TR-003-M50']);
    for (const t of trial.trays) {
      expect(t.weekly).toEqual([{ week: 0, heightCm: 12, leafHealth: expect.any(Number), alive: 12 }]);
      expect(t.logs).toEqual([]);
    }
    expect(next.batches[0].status).toBe('sent_to_nursery');
  });

  test('createTrial rejects batches that did not pass', () => {
    const state = sample();
    expect(reducer(state, { type: 'createTrial', id: 'RL-TR-003', species: 'angsana', batchId: 'RL-B-2026-002', now })).toBe(state);
  });

  test('createTrial from a passed batch marks it sent to nursery', () => {
    const state = sample();
    state.batches[2] = { ...state.batches[2], status: 'passed' };
    const next = reducer(state, { type: 'createTrial', id: 'RL-TR-003', species: 'kelat', batchId: 'RL-B-2026-003', now });
    expect(next.batches[2].status).toBe('sent_to_nursery');
  });

  test('addWeeklyRecord appends to the tray', () => {
    const record = { week: 7, heightCm: 23, leafHealth: 85, alive: 12 };
    const next = reducer(sample(), { type: 'addWeeklyRecord', trialId: 'RL-TR-002', trayId: 'RL-TR-002-M25', record });
    expect(next.trials[1].trays[1].weekly.at(-1)).toEqual(record);
  });

  test('a death log reduces the latest alive count', () => {
    const next = reducer(sample(), {
      type: 'addTrayLog',
      trialId: 'RL-TR-002',
      trayId: 'RL-TR-002-M25',
      log: { date: '2026-10-19', kind: 'death', note: 'Stem rot', count: 2 },
    });
    const tray = next.trials[1].trays[1];
    expect(tray.weekly.at(-1)!.alive).toBe(10);
    expect(tray.logs.at(-1)).toMatchObject({ kind: 'death', count: 2 });
  });

  test('a death log never goes below zero', () => {
    const next = reducer(sample(), {
      type: 'addTrayLog',
      trialId: 'RL-TR-002',
      trayId: 'RL-TR-002-M25',
      log: { date: '2026-10-19', kind: 'death', note: 'Flood', count: 99 },
    });
    expect(next.trials[1].trays[1].weekly.at(-1)!.alive).toBe(0);
  });

  test('createTree appends', () => {
    const tree = { id: 'RL-T-0007', species: 'tembusu' as const, trayId: 'RL-TR-002-M25', batchId: 'RL-B-2026-001' };
    expect(reducer(sample(), { type: 'createTree', tree }).trees.at(-1)).toEqual(tree);
  });

  test('unknown ids leave state unchanged', () => {
    const state = sample();
    expect(reducer(state, { type: 'markReadyForTest', batchId: 'nope' })).toBe(state);
    expect(
      reducer(state, { type: 'addWeeklyRecord', trialId: 'nope', trayId: 'x', record: { week: 1, heightCm: 1, leafHealth: 1, alive: 1 } }),
    ).toBe(state);
  });
});
