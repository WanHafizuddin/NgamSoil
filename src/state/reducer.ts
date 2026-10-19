import {
  MIX_PCTS,
  type AppData,
  type Intake,
  type SpeciesId,
  type TestResult,
  type Tray,
  type TrayLog,
  type Tree,
  type WeeklyRecord,
} from '../types';
import { buildSampleData, emptyData } from '../data/sampleData';
import { generateTempReadings } from '../sim/temperature';
import { generateMoistureReadings } from '../sim/moisture';
import { GROWTH_PROFILES, SEEDLINGS_PER_TRAY } from '../sim/growth';
import { hashString } from '../lib/random';
import { toLocalDate } from '../lib/dates';
import { trayId } from '../lib/ids';

export type Action =
  | { type: 'reset' }
  | { type: 'clear' }
  | { type: 'addIntake'; intake: Intake }
  | { type: 'createBatch'; id: string; intakeIds: string[]; now: string }
  | { type: 'markReadyForTest'; batchId: string }
  | { type: 'saveTestResult'; batchId: string; result: TestResult }
  | { type: 'createTrial'; id: string; species: SpeciesId; batchId: string; now: string }
  | { type: 'addWeeklyRecord'; trialId: string; trayId: string; record: WeeklyRecord }
  | { type: 'addTrayLog'; trialId: string; trayId: string; log: TrayLog }
  | { type: 'createTree'; tree: Tree };

const MAX_READING_DAYS = 60;
const DAY_MS = 24 * 3_600_000;

function updateTray(state: AppData, trialId: string, id: string, fn: (tray: Tray) => Tray): AppData {
  const trial = state.trials.find((t) => t.id === trialId);
  if (!trial || !trial.trays.some((t) => t.id === id)) return state;
  return {
    ...state,
    trials: state.trials.map((t) =>
      t.id === trialId ? { ...t, trays: t.trays.map((tray) => (tray.id === id ? fn(tray) : tray)) } : t,
    ),
  };
}

function createBatch(state: AppData, id: string, intakeIds: string[], now: string): AppData {
  const linked = state.intakes.filter((i) => intakeIds.includes(i.id) && !i.batchId);
  if (linked.length === 0) return state;

  const earliest = Math.min(...linked.map((i) => Date.parse(`${i.date}T00:00:00.000Z`)));
  const start = new Date(Math.max(earliest, Date.parse(now) - MAX_READING_DAYS * DAY_MS)).toISOString();
  const linkedIds = new Set(linked.map((i) => i.id));

  return {
    ...state,
    intakes: state.intakes.map((i) => (linkedIds.has(i.id) ? { ...i, batchId: id } : i)),
    batches: [
      ...state.batches,
      {
        id,
        createdAt: now,
        intakeIds: linked.map((i) => i.id),
        status: 'composting',
        tempReadings: generateTempReadings({ start, end: now, seed: hashString(id) }),
      },
    ],
  };
}

function createTrial(state: AppData, id: string, species: SpeciesId, batchId: string, now: string): AppData {
  const batch = state.batches.find((b) => b.id === batchId);
  if (!batch || (batch.status !== 'passed' && batch.status !== 'sent_to_nursery')) return state;

  const profile = GROWTH_PROFILES[species];
  const trays: Tray[] = MIX_PCTS.map((mixPct) => {
    const tid = trayId(id, mixPct);
    return {
      id: tid,
      mixPct,
      moisture: generateMoistureReadings({ start: now, end: now, seed: hashString(tid), mixPct }),
      weekly: [{ week: 0, heightCm: profile.initialHeightCm, leafHealth: profile.mixes[mixPct].leafHealth, alive: SEEDLINGS_PER_TRAY }],
      logs: [],
    };
  });

  return {
    ...state,
    batches: state.batches.map((b) => (b.id === batchId ? { ...b, status: 'sent_to_nursery' } : b)),
    trials: [...state.trials, { id, species, batchId, startDate: toLocalDate(now), trays }],
  };
}

export function reducer(state: AppData, action: Action): AppData {
  switch (action.type) {
    case 'reset':
      return buildSampleData();
    case 'clear':
      return emptyData();
    case 'addIntake':
      return { ...state, intakes: [...state.intakes, action.intake] };
    case 'createBatch':
      return createBatch(state, action.id, action.intakeIds, action.now);
    case 'markReadyForTest': {
      const batch = state.batches.find((b) => b.id === action.batchId);
      if (batch?.status !== 'composting') return state;
      return {
        ...state,
        batches: state.batches.map((b) => (b.id === action.batchId ? { ...b, status: 'ready_for_test' } : b)),
      };
    }
    case 'saveTestResult': {
      const batch = state.batches.find((b) => b.id === action.batchId);
      if (batch?.status !== 'ready_for_test') return state;
      const status = action.result.passed ? 'passed' : 'failed';
      return {
        ...state,
        batches: state.batches.map((b) => (b.id === action.batchId ? { ...b, status, testResult: action.result } : b)),
      };
    }
    case 'createTrial':
      return createTrial(state, action.id, action.species, action.batchId, action.now);
    case 'addWeeklyRecord':
      return updateTray(state, action.trialId, action.trayId, (tray) => ({ ...tray, weekly: [...tray.weekly, action.record] }));
    case 'addTrayLog':
      return updateTray(state, action.trialId, action.trayId, (tray) => {
        const deaths = action.log.kind === 'death' ? (action.log.count ?? 0) : 0;
        const weekly =
          deaths > 0 && tray.weekly.length > 0
            ? tray.weekly.map((w, i) => (i === tray.weekly.length - 1 ? { ...w, alive: Math.max(0, w.alive - deaths) } : w))
            : tray.weekly;
        return { ...tray, weekly, logs: [...tray.logs, action.log] };
      });
    case 'createTree':
      return { ...state, trees: [...state.trees, action.tree] };
  }
}
