import { expect, test } from 'vitest';
import { computeKpis, wasteByWeek } from './kpis';
import type { AppData, Batch, BatchStatus, Intake, Tray } from '../types';

const intake = (id: string, date: string, weightKg: number, batchId?: string): Intake => ({
  id,
  date,
  source: 'Landscape team',
  material: 'leaves',
  weightKg,
  collector: 'Aiman',
  batchId,
});

const batch = (id: string, status: BatchStatus, intakeIds: string[] = []): Batch => ({
  id,
  createdAt: '2026-10-01T00:00:00.000Z',
  intakeIds,
  status,
  tempReadings: [],
});

const tray = (aliveEnd: number): Tray => ({
  id: `T${aliveEnd}`,
  mixPct: 0,
  moisture: [],
  logs: [],
  weekly: [
    { week: 0, heightCm: 10, leafHealth: 80, alive: 12 },
    { week: 1, heightCm: 11, leafHealth: 80, alive: aliveEnd },
  ],
});

test('empty data gives zeros and no NaN', () => {
  const k = computeKpis({ version: 1, intakes: [], batches: [], trials: [], trees: [] });
  expect(k).toEqual({
    wasteDivertedKg: 0,
    batchesActive: 0,
    batchesPassed: 0,
    batchesFailed: 0,
    seedlingsGrowing: 0,
    survivalRate: null,
    estimatedSoilSavedKg: 0,
  });
});

test('computes KPIs from data', () => {
  const data: AppData = {
    version: 1,
    intakes: [intake('I1', '2026-10-01', 100, 'B1'), intake('I2', '2026-10-02', 50.4, 'B1')],
    batches: [
      batch('B1', 'sent_to_nursery', ['I1', 'I2']),
      batch('B2', 'composting'),
      batch('B3', 'ready_for_test'),
      batch('B4', 'failed'),
    ],
    trials: [{ id: 'TR', species: 'meranti', batchId: 'B1', startDate: '2026-09-07', trays: [tray(10), tray(12)] }],
    trees: [],
  };
  const k = computeKpis(data);
  expect(k.wasteDivertedKg).toBeCloseTo(150.4);
  expect(k.estimatedSoilSavedKg).toBeCloseTo(60.16);
  expect(k).toMatchObject({ batchesActive: 2, batchesPassed: 1, batchesFailed: 1, seedlingsGrowing: 22 });
  expect(k.survivalRate).toBeCloseTo(22 / 24);
});

test('deaths logged on the week-0 record still lower survival', () => {
  const data: AppData = {
    version: 1,
    intakes: [],
    batches: [],
    trials: [
      {
        id: 'TR',
        species: 'angsana',
        batchId: 'B1',
        startDate: '2026-10-19',
        trays: [{ id: 'T', mixPct: 0, moisture: [], logs: [], weekly: [{ week: 0, heightCm: 12, leafHealth: 76, alive: 6 }] }],
      },
    ],
    trees: [],
  };
  expect(computeKpis(data).survivalRate).toBeCloseTo(0.5);
});

test('wasteByWeek zero-fills weeks ending at the latest intake', () => {
  const intakes = [intake('a', '2026-10-12', 10), intake('b', '2026-10-18', 5), intake('c', '2026-10-05', 20)];
  expect(wasteByWeek(intakes, 3)).toEqual([
    { weekStart: '2026-09-28', kg: 0 },
    { weekStart: '2026-10-05', kg: 20 },
    { weekStart: '2026-10-12', kg: 15 },
  ]);
  expect(wasteByWeek([])).toEqual([]);
});
