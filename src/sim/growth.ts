import type { MixPct, SpeciesId } from '../types';

export const SEEDLINGS_PER_TRAY = 12;

export interface MixProfile {
  cmPerWeek: number;
  leafHealth: number;
  deaths: number;
}

export interface GrowthProfile {
  initialHeightCm: number;
  mixes: Record<MixPct, MixProfile>;
}

export const GROWTH_PROFILES: Record<SpeciesId, GrowthProfile> = {
  meranti: {
    initialHeightCm: 10,
    mixes: {
      0: { cmPerWeek: 1.6, leafHealth: 80, deaths: 1 },
      25: { cmPerWeek: 1.7, leafHealth: 81, deaths: 1 },
      50: { cmPerWeek: 1.0, leafHealth: 64, deaths: 3 },
      75: { cmPerWeek: 0.8, leafHealth: 58, deaths: 3 },
    },
  },
  tembusu: {
    initialHeightCm: 8,
    mixes: {
      0: { cmPerWeek: 1.4, leafHealth: 72, deaths: 2 },
      25: { cmPerWeek: 2.1, leafHealth: 85, deaths: 0 },
      50: { cmPerWeek: 2.4, leafHealth: 78, deaths: 1 },
      75: { cmPerWeek: 1.2, leafHealth: 70, deaths: 2 },
    },
  },
  angsana: {
    initialHeightCm: 12,
    mixes: {
      0: { cmPerWeek: 2.4, leafHealth: 76, deaths: 1 },
      25: { cmPerWeek: 2.8, leafHealth: 82, deaths: 0 },
      50: { cmPerWeek: 3.0, leafHealth: 84, deaths: 0 },
      75: { cmPerWeek: 2.6, leafHealth: 74, deaths: 2 },
    },
  },
  kelat: {
    initialHeightCm: 9,
    mixes: {
      0: { cmPerWeek: 1.2, leafHealth: 78, deaths: 1 },
      25: { cmPerWeek: 1.4, leafHealth: 83, deaths: 0 },
      50: { cmPerWeek: 1.3, leafHealth: 79, deaths: 1 },
      75: { cmPerWeek: 1.0, leafHealth: 72, deaths: 2 },
    },
  },
};
