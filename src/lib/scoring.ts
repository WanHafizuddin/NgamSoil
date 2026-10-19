import type { MixPct, SpeciesId, Tray, Trial } from '../types';
import { round1 } from './random';
import { SEEDLINGS_PER_TRAY } from '../sim/growth';

export const SCORE_WEIGHTS = { height: 0.5, leafHealth: 0.3, survival: 0.2 };

export interface MixScore {
  mixPct: MixPct;
  score: number;
  growthPerWeekCm: number;
  avgLeafHealth: number;
  survivalRate: number;
  trayCount: number;
  weeks: number;
}

export interface Recommendation {
  species: SpeciesId;
  best: MixScore;
  ranking: MixScore[];
  trialCount: number;
  trayCount: number;
  weekCount: number;
  reason: string;
}

const mean = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;

// Growth is compared per week so trays with different trial lengths stay comparable.
// Survival is measured against the planted count, because early deaths lower the week-0 record.
function trayMetrics(tray: Tray) {
  if (tray.weekly.length < 2) return null;
  const first = tray.weekly[0];
  const last = tray.weekly[tray.weekly.length - 1];
  if (last.week <= first.week) return null;
  const later = tray.weekly.filter((w) => w.week >= 1);
  const planted = Math.max(first.alive, SEEDLINGS_PER_TRAY);
  return {
    mixPct: tray.mixPct,
    growthPerWeek: (last.heightCm - first.heightCm) / (last.week - first.week),
    avgLeaf: later.length > 0 ? mean(later.map((w) => w.leafHealth)) : first.leafHealth,
    survival: last.alive / planted,
    weeks: last.week,
  };
}

export function scoreTrays(trays: Tray[]): MixScore[] {
  const groups = new Map<MixPct, NonNullable<ReturnType<typeof trayMetrics>>[]>();
  for (const tray of trays) {
    const m = trayMetrics(tray);
    if (m) groups.set(m.mixPct, [...(groups.get(m.mixPct) ?? []), m]);
  }

  const mixes = [...groups.entries()].map(([mixPct, ms]) => ({
    mixPct,
    growthPerWeekCm: mean(ms.map((m) => m.growthPerWeek)),
    avgLeafHealth: mean(ms.map((m) => m.avgLeaf)),
    survivalRate: mean(ms.map((m) => m.survival)),
    trayCount: ms.length,
    weeks: Math.max(...ms.map((m) => m.weeks)),
  }));
  const maxGrowth = Math.max(0, ...mixes.map((m) => m.growthPerWeekCm));

  return mixes
    .map((m) => {
      const heightScore = maxGrowth > 0 ? Math.max(0, m.growthPerWeekCm) / maxGrowth : 0;
      const score =
        100 *
        (SCORE_WEIGHTS.height * heightScore +
          (SCORE_WEIGHTS.leafHealth * m.avgLeafHealth) / 100 +
          SCORE_WEIGHTS.survival * m.survivalRate);
      return { ...m, score: round1(score) };
    })
    .sort((a, b) => b.score - a.score || a.mixPct - b.mixPct);
}

export function recommendForSpecies(trials: Trial[], species: SpeciesId): Recommendation | null {
  const speciesTrials = trials.filter((t) => t.species === species);
  const ranking = scoreTrays(speciesTrials.flatMap((t) => t.trays));
  if (ranking.length === 0) return null;

  const best = ranking[0];
  const weekCount = Math.max(...ranking.map((m) => m.weeks));
  const control = ranking.find((m) => m.mixPct === 0);
  const base =
    `${best.mixPct}% compost grew ${best.growthPerWeekCm.toFixed(1)} cm a week over ${weekCount} ${weekCount === 1 ? 'week' : 'weeks'} ` +
    `with leaf health ${Math.round(best.avgLeafHealth)}/100 and ${Math.round(best.survivalRate * 100)}% survival`;
  const reason =
    best.mixPct !== 0 && control ? `${base}, vs ${control.growthPerWeekCm.toFixed(1)} cm a week for the 0% control.` : `${base}.`;

  return {
    species,
    best,
    ranking,
    trialCount: speciesTrials.length,
    trayCount: ranking.reduce((s, m) => s + m.trayCount, 0),
    weekCount,
    reason,
  };
}
