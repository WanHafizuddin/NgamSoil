import { expect, test } from 'vitest';
import { nextBatchId, nextIntakeId, nextTreeId, nextTrialId, trayId } from './ids';

const ids = (...list: string[]) => list.map((id) => ({ id }));

test('nextBatchId', () => {
  expect(nextBatchId([], 2026)).toBe('NS-B-2026-001');
  expect(nextBatchId(ids('NS-B-2026-001', 'NS-B-2026-004'), 2026)).toBe('NS-B-2026-005');
  expect(nextBatchId(ids('NS-B-2025-007'), 2026)).toBe('NS-B-2026-001');
});

test('nextIntakeId, nextTreeId, nextTrialId', () => {
  expect(nextIntakeId([])).toBe('NS-I-0001');
  expect(nextIntakeId(ids('NS-I-0022'))).toBe('NS-I-0023');
  expect(nextTreeId([])).toBe('NS-T-0001');
  expect(nextTreeId(ids('NS-T-0006'))).toBe('NS-T-0007');
  expect(nextTrialId([])).toBe('NS-TR-001');
  expect(nextTrialId(ids('NS-TR-002'))).toBe('NS-TR-003');
});

test('trayId', () => {
  expect(trayId('NS-TR-001', 25)).toBe('NS-TR-001-M25');
});
