import { describe, expect, test } from 'vitest';
import { buildSampleData, emptyData } from './sampleData';
import { activeAlerts, detectAlerts } from '../lib/alerts';
import { recommendForSpecies } from '../lib/scoring';
import { computeKpis } from '../lib/kpis';

const d = buildSampleData();

describe('buildSampleData', () => {
  test('is deterministic', () => {
    expect(buildSampleData()).toEqual(d);
  });

  test('has 22 intakes totalling about 1,200 kg', () => {
    expect(d.intakes).toHaveLength(22);
    const total = d.intakes.reduce((s, i) => s + i.weightKg, 0);
    expect(total).toBeGreaterThanOrEqual(1190);
    expect(total).toBeLessThanOrEqual(1210);
    expect(d.intakes.map((i) => i.id)).toEqual(Array.from({ length: 22 }, (_, k) => `NS-I-${String(k + 1).padStart(4, '0')}`));
  });

  test('has 4 batches with the spec statuses and GI results', () => {
    expect(d.batches.map((b) => [b.id, b.status])).toEqual([
      ['NS-B-2026-001', 'sent_to_nursery'],
      ['NS-B-2026-002', 'failed'],
      ['NS-B-2026-003', 'ready_for_test'],
      ['NS-B-2026-004', 'composting'],
    ]);
    expect(d.batches[0].testResult).toMatchObject({ gi: 92, passed: true });
    expect(d.batches[1].testResult).toMatchObject({ gi: 64, passed: false });
    expect(d.batches[2].testResult).toBeUndefined();
  });

  test('links intakes and batches both ways', () => {
    for (const b of d.batches) {
      for (const id of b.intakeIds) {
        expect(d.intakes.find((i) => i.id === id)?.batchId).toBe(b.id);
      }
    }
    const unbatched = d.intakes.filter((i) => !i.batchId).map((i) => i.id);
    expect(unbatched).toEqual(['NS-I-0014', 'NS-I-0021', 'NS-I-0022']);
  });

  test('alerts only on the composting batch', () => {
    expect(detectAlerts(d.batches[3]).map((a) => a.kind).sort()).toEqual(['sensor_offline', 'too_cold']);
    expect(detectAlerts(d.batches[0])).toEqual([]);
    expect(detectAlerts(d.batches[2])).toEqual([]);
    expect(activeAlerts(d.batches)).toHaveLength(2);
  });

  test('has 3 trials with 4 trays of 7 weekly records', () => {
    expect(d.trials.map((t) => [t.id, t.species])).toEqual([
      ['NS-TR-001', 'meranti'],
      ['NS-TR-002', 'tembusu'],
      ['NS-TR-003', 'angsana'],
    ]);
    for (const t of d.trials) {
      expect(t.trays.map((tr) => tr.id)).toEqual([`${t.id}-M0`, `${t.id}-M25`, `${t.id}-M50`, `${t.id}-M75`]);
      for (const tr of t.trays) {
        expect(tr.weekly).toHaveLength(7);
        expect(tr.moisture.length).toBeGreaterThan(100);
      }
    }
  });

  test('recommendation ranking for the sample data', () => {
    const tem = recommendForSpecies(d.trials, 'tembusu')!;
    expect(tem.ranking.map((m) => m.mixPct)).toEqual([50, 25, 0, 75]);

    const mer = recommendForSpecies(d.trials, 'meranti')!;
    expect(mer.ranking.map((m) => m.mixPct)).toEqual([25, 0, 50, 75]);
    const s = Object.fromEntries(mer.ranking.map((m) => [m.mixPct, m.score]));
    expect(s[25] - s[0]).toBeGreaterThan(0);
    expect(s[25] - s[0]).toBeLessThan(6);
    expect(s[0] - s[50]).toBeGreaterThanOrEqual(15);
    expect(s[50] - s[75]).toBeGreaterThan(0);

    const ang = recommendForSpecies(d.trials, 'angsana')!;
    expect(ang.ranking.map((m) => m.mixPct)).toEqual([50, 25, 75, 0]);
    const a = Object.fromEntries(ang.ranking.map((m) => [m.mixPct, m.score]));
    expect(a[50] - a[25]).toBeGreaterThanOrEqual(2);

    expect(recommendForSpecies(d.trials, 'kelat')).toBeNull();
  });

  test('KPIs match the story', () => {
    expect(computeKpis(d)).toMatchObject({ batchesActive: 2, batchesPassed: 1, batchesFailed: 1, seedlingsGrowing: 128 });
  });

  test('has 6 tagged trees', () => {
    expect(d.trees.map((t) => t.id)).toEqual(['NS-T-0001', 'NS-T-0002', 'NS-T-0003', 'NS-T-0004', 'NS-T-0005', 'NS-T-0006']);
    expect(d.trees[0]).toMatchObject({ species: 'tembusu', trayId: 'NS-TR-002-M25', batchId: 'NS-B-2026-001' });
  });
});

test('emptyData', () => {
  expect(emptyData()).toEqual({ version: 1, intakes: [], batches: [], trials: [], trees: [] });
});
