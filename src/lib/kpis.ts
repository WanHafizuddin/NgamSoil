import type { AppData, Intake } from '../types';
import { addDays, weekStart } from './dates';
import { round1 } from './random';
import { SEEDLINGS_PER_TRAY } from '../sim/growth';

export const COMPOST_YIELD = 0.4;

export interface Kpis {
  wasteDivertedKg: number;
  batchesActive: number;
  batchesPassed: number;
  batchesFailed: number;
  seedlingsGrowing: number;
  survivalRate: number | null;
  estimatedSoilSavedKg: number;
}

const sum = (xs: number[]) => xs.reduce((s, x) => s + x, 0);

export function computeKpis(data: AppData): Kpis {
  const count = (...statuses: string[]) => data.batches.filter((b) => statuses.includes(b.status)).length;
  const passedIds = new Set(
    data.batches.filter((b) => b.status === 'passed' || b.status === 'sent_to_nursery').map((b) => b.id),
  );

  const trays = data.trials.flatMap((t) => t.trays).filter((t) => t.weekly.length > 0);
  const growing = sum(trays.map((t) => t.weekly[t.weekly.length - 1].alive));
  const initial = sum(trays.map((t) => Math.max(t.weekly[0].alive, SEEDLINGS_PER_TRAY)));

  return {
    wasteDivertedKg: sum(data.intakes.map((i) => i.weightKg)),
    batchesActive: count('composting', 'ready_for_test'),
    batchesPassed: count('passed', 'sent_to_nursery'),
    batchesFailed: count('failed'),
    seedlingsGrowing: growing,
    survivalRate: initial > 0 ? growing / initial : null,
    estimatedSoilSavedKg:
      COMPOST_YIELD * sum(data.intakes.filter((i) => i.batchId && passedIds.has(i.batchId)).map((i) => i.weightKg)),
  };
}

export function wasteByWeek(intakes: Intake[], weeks = 8): { weekStart: string; kg: number }[] {
  if (intakes.length === 0) return [];
  const latest = intakes.reduce((max, i) => (i.date > max ? i.date : max), intakes[0].date);
  const lastWeek = weekStart(latest);

  const totals = new Map<string, number>();
  for (const i of intakes) {
    const ws = weekStart(i.date);
    totals.set(ws, (totals.get(ws) ?? 0) + i.weightKg);
  }

  return Array.from({ length: weeks }, (_, k) => {
    const ws = addDays(lastWeek, -7 * (weeks - 1 - k));
    return { weekStart: ws, kg: round1(totals.get(ws) ?? 0) };
  });
}
