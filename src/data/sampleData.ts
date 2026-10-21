import {
  INTAKE_SOURCES,
  MATERIALS,
  MIX_PCTS,
  type AppData,
  type Batch,
  type BatchStatus,
  type GerminationInput,
  type Intake,
  type Material,
  type MixPct,
  type SpeciesId,
  type Tray,
  type TrayLog,
  type Tree,
  type Trial,
} from '../types';
import { hashString, mulberry32, pick, randFloat, randInt, round1 } from '../lib/random';
import { addDays } from '../lib/dates';
import { computeGI, isPass } from '../lib/gi';
import { trayId } from '../lib/ids';
import { generateTempReadings, type TempOptions } from '../sim/temperature';
import { generateMoistureReadings } from '../sim/moisture';
import { GROWTH_PROFILES, SEEDLINGS_PER_TRAY } from '../sim/growth';

export const SAMPLE_SEED = 20261019;
export const SAMPLE_NOW = '2026-10-19T00:00:00.000Z';

const COLLECTORS = ['Aiman', 'Siti', 'Kumar', 'Mei Ling', 'Farid'] as const;
const WEIGHT_RANGE: Record<Material, [number, number]> = { leaves: [30, 70], grass: [40, 80], branches: [50, 90] };
const TOTAL_KG = 1200;

const INTAKE_PLAN: { date: string; batchId?: string }[] = [
  ...['2026-07-06', '2026-07-08', '2026-07-10', '2026-07-12'].map((date) => ({ date, batchId: 'NS-B-2026-001' })),
  ...['2026-09-07', '2026-09-08', '2026-09-09', '2026-09-10'].map((date) => ({ date, batchId: 'NS-B-2026-002' })),
  ...['2026-09-11', '2026-09-12', '2026-09-14', '2026-09-16', '2026-09-17'].map((date) => ({ date, batchId: 'NS-B-2026-003' })),
  { date: '2026-09-22' },
  ...['2026-09-29', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-05', '2026-10-06'].map((date) => ({
    date,
    batchId: 'NS-B-2026-004',
  })),
  { date: '2026-10-12' },
  { date: '2026-10-16' },
];

const CONTROL_ROOTS = [38, 42, 40, 41, 39, 40, 43, 37, 40, 40];
const PASS_TEST: GerminationInput = {
  seedsSample: 10,
  seedsControl: 10,
  rootLengthsSample: [36, 38, 35, 37, 39, 36, 37, 38, 36, 36],
  rootLengthsControl: CONTROL_ROOTS,
};
const FAIL_TEST: GerminationInput = {
  seedsSample: 8,
  seedsControl: 10,
  rootLengthsSample: [30, 34, 31, 33, 32, 29, 35, 32],
  rootLengthsControl: CONTROL_ROOTS,
};

interface BatchPlan extends Pick<TempOptions, 'peak' | 'dips' | 'gaps'> {
  id: string;
  readingsEnd: string;
  status: BatchStatus;
  test?: { date: string; input: GerminationInput };
}

const BATCH_PLAN: BatchPlan[] = [
  {
    id: 'NS-B-2026-001',
    readingsEnd: '2026-08-15T00:00:00.000Z',
    peak: 62,
    status: 'sent_to_nursery',
    test: { date: '2026-08-25T02:00:00.000Z', input: PASS_TEST },
  },
  {
    id: 'NS-B-2026-002',
    readingsEnd: '2026-10-12T00:00:00.000Z',
    peak: 48,
    dips: [{ fromHour: 120, hours: 80, celsius: 37 }],
    status: 'failed',
    test: { date: '2026-10-13T02:00:00.000Z', input: FAIL_TEST },
  },
  { id: 'NS-B-2026-003', readingsEnd: '2026-10-18T00:00:00.000Z', peak: 60, status: 'ready_for_test' },
  {
    id: 'NS-B-2026-004',
    readingsEnd: SAMPLE_NOW,
    peak: 63,
    gaps: [{ fromHour: 200, hours: 3 }],
    dips: [{ fromHour: 300, hours: 6, celsius: 37 }],
    status: 'composting',
  },
];

const TRIAL_START = '2026-09-07';
const TRIAL_PLAN: { id: string; species: SpeciesId }[] = [
  { id: 'NS-TR-001', species: 'meranti' },
  { id: 'NS-TR-002', species: 'tembusu' },
  { id: 'NS-TR-003', species: 'angsana' },
];

const TREE_PLAN: Omit<Tree, 'batchId'>[] = [
  { id: 'NS-T-0001', species: 'tembusu', trayId: 'NS-TR-002-M25' },
  { id: 'NS-T-0002', species: 'tembusu', trayId: 'NS-TR-002-M25' },
  { id: 'NS-T-0003', species: 'tembusu', trayId: 'NS-TR-002-M25' },
  { id: 'NS-T-0004', species: 'meranti', trayId: 'NS-TR-001-M25' },
  { id: 'NS-T-0005', species: 'meranti', trayId: 'NS-TR-001-M25' },
  { id: 'NS-T-0006', species: 'meranti', trayId: 'NS-TR-001-M0' },
];

function buildIntakes(): Intake[] {
  const rng = mulberry32(SAMPLE_SEED);
  const drafts = INTAKE_PLAN.map((p) => {
    const material = pick(rng, MATERIALS);
    const source = pick(rng, INTAKE_SOURCES);
    const collector = pick(rng, COLLECTORS);
    const [lo, hi] = WEIGHT_RANGE[material];
    return { ...p, material, source, collector, raw: randFloat(rng, lo, hi) };
  });
  const scale = TOTAL_KG / drafts.reduce((s, d) => s + d.raw, 0);

  return drafts.map((d, k) => ({
    id: `NS-I-${String(k + 1).padStart(4, '0')}`,
    date: d.date,
    source: d.source,
    material: d.material,
    weightKg: Math.round(d.raw * scale * 2) / 2,
    collector: d.collector,
    ...(d.batchId ? { batchId: d.batchId } : {}),
  }));
}

function buildBatch(plan: BatchPlan, intakes: Intake[]): Batch {
  const linked = intakes.filter((i) => i.batchId === plan.id);
  const batch: Batch = {
    id: plan.id,
    createdAt: `${linked[0].date}T02:00:00.000Z`,
    intakeIds: linked.map((i) => i.id),
    status: plan.status,
    tempReadings: generateTempReadings({
      start: `${linked[0].date}T00:00:00.000Z`,
      end: plan.readingsEnd,
      seed: hashString(plan.id),
      peak: plan.peak,
      dips: plan.dips,
      gaps: plan.gaps,
    }),
  };
  if (plan.test) {
    const gi = computeGI(plan.test.input)!;
    batch.testResult = { ...plan.test.input, date: plan.test.date, gi, passed: isPass(gi) };
  }
  return batch;
}

function buildTray(trialId: string, species: SpeciesId, mixPct: MixPct): Tray {
  const id = trayId(trialId, mixPct);
  const rng = mulberry32(hashString(id));
  const { initialHeightCm, mixes } = GROWTH_PROFILES[species];
  const profile = mixes[mixPct];
  const deathWeeks = [2, 3, 4].slice(0, profile.deaths);

  const weekly = Array.from({ length: 7 }, (_, week) => {
    const alive = SEEDLINGS_PER_TRAY - deathWeeks.filter((w) => w <= week).length;
    if (week === 0) return { week, heightCm: initialHeightCm, leafHealth: profile.leafHealth, alive };
    return {
      week,
      heightCm: round1(initialHeightCm + week * profile.cmPerWeek + (rng() - 0.5) * 0.06),
      leafHealth: profile.leafHealth + randInt(rng, -1, 1),
      alive,
    };
  });

  const logs: TrayLog[] = [
    ...deathWeeks.map((w): TrayLog => ({ date: addDays(TRIAL_START, 7 * w), kind: 'death', note: 'Seedling died', count: 1 })),
    ...[1, 2, 3, 4, 5, 6].map((w): TrayLog => ({ date: addDays(TRIAL_START, 7 * w), kind: 'watering', note: 'Watered 500 ml' })),
  ];
  if (id === 'NS-TR-001-M50') {
    logs.push({ date: addDays(TRIAL_START, 21), kind: 'pest', note: 'Aphids on two seedlings, removed by hand' });
  }
  logs.sort((a, b) => a.date.localeCompare(b.date));

  return {
    id,
    mixPct,
    moisture: generateMoistureReadings({ start: `${TRIAL_START}T00:00:00.000Z`, end: SAMPLE_NOW, seed: hashString(id), mixPct }),
    weekly,
    logs,
  };
}

export function buildSampleData(): AppData {
  const intakes = buildIntakes();
  const trials: Trial[] = TRIAL_PLAN.map((t) => ({
    id: t.id,
    species: t.species,
    batchId: 'NS-B-2026-001',
    startDate: TRIAL_START,
    trays: MIX_PCTS.map((mix) => buildTray(t.id, t.species, mix)),
  }));

  return {
    version: 1,
    intakes,
    batches: BATCH_PLAN.map((p) => buildBatch(p, intakes)),
    trials,
    trees: TREE_PLAN.map((t) => ({ ...t, batchId: 'NS-B-2026-001' })),
  };
}

export function emptyData(): AppData {
  return { version: 1, intakes: [], batches: [], trials: [], trees: [] };
}
