import type { MixPct } from '../types';

type HasId = { id: string };

function nextId(items: readonly HasId[], prefix: string, digits: number): string {
  let max = 0;
  for (const { id } of items) {
    const rest = id.startsWith(prefix) ? id.slice(prefix.length) : '';
    if (/^\d+$/.test(rest)) max = Math.max(max, Number(rest));
  }
  return `${prefix}${String(max + 1).padStart(digits, '0')}`;
}

export function nextBatchId(batches: readonly HasId[], year: number): string {
  return nextId(batches, `RL-B-${year}-`, 3);
}

export function nextIntakeId(intakes: readonly HasId[]): string {
  return nextId(intakes, 'RL-I-', 4);
}

export function nextTrialId(trials: readonly HasId[]): string {
  return nextId(trials, 'RL-TR-', 3);
}

export function nextTreeId(trees: readonly HasId[]): string {
  return nextId(trees, 'RL-T-', 4);
}

export function trayId(trialId: string, mixPct: MixPct): string {
  return `${trialId}-M${mixPct}`;
}
