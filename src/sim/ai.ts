import type { GerminationInput, MixPct, SpeciesId } from '../types';
import { mulberry32, randFloat, randInt, round1 } from '../lib/random';
import { GROWTH_PROFILES } from './growth';

export const SEEDS_PER_DISH = 10;

export function simulateGerminationAnalysis(seed: number): GerminationInput {
  const rng = mulberry32(seed);
  const rootLengthsControl = Array.from({ length: SEEDS_PER_DISH }, () => round1(randFloat(rng, 36, 44)));
  const seedsSample = randInt(rng, 8, 10);
  const rootLengthsSample = Array.from({ length: seedsSample }, () => round1(randFloat(rng, 30, 44)));
  return { seedsSample, seedsControl: SEEDS_PER_DISH, rootLengthsSample, rootLengthsControl };
}

export function simulateSeedlingAnalysis(a: {
  species: SpeciesId;
  mixPct: MixPct;
  prevHeightCm: number;
  seed: number;
}): { heightCm: number; leafHealth: number } {
  const rng = mulberry32(a.seed);
  const profile = GROWTH_PROFILES[a.species].mixes[a.mixPct];
  const heightCm = round1(a.prevHeightCm + profile.cmPerWeek + (rng() - 0.5) * 0.06);
  const leafHealth = Math.min(100, Math.max(0, profile.leafHealth + randInt(rng, -1, 1)));
  return { heightCm, leafHealth };
}
