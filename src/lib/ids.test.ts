import { expect, test } from 'vitest';
import { nextBatchId, nextIntakeId, nextTreeId, nextTrialId, trayId } from './ids';

const ids = (...list: string[]) => list.map((id) => ({ id }));

test('nextBatchId', () => {
  expect(nextBatchId([], 2026)).toBe('RL-B-2026-001');
  expect(nextBatchId(ids('RL-B-2026-001', 'RL-B-2026-004'), 2026)).toBe('RL-B-2026-005');
  expect(nextBatchId(ids('RL-B-2025-007'), 2026)).toBe('RL-B-2026-001');
});

test('nextIntakeId, nextTreeId, nextTrialId', () => {
  expect(nextIntakeId([])).toBe('RL-I-0001');
  expect(nextIntakeId(ids('RL-I-0022'))).toBe('RL-I-0023');
  expect(nextTreeId([])).toBe('RL-T-0001');
  expect(nextTreeId(ids('RL-T-0006'))).toBe('RL-T-0007');
  expect(nextTrialId([])).toBe('RL-TR-001');
  expect(nextTrialId(ids('RL-TR-002'))).toBe('RL-TR-003');
});

test('trayId', () => {
  expect(trayId('RL-TR-001', 25)).toBe('RL-TR-001-M25');
});
