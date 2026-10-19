export type Role = 'admin' | 'staff' | 'public';

export const INTAKE_SOURCES = ['Elmina Central Park', 'Resident drop-off point', 'Landscape team'] as const;
export type IntakeSource = (typeof INTAKE_SOURCES)[number];

export const MATERIALS = ['leaves', 'branches', 'grass'] as const;
export type Material = (typeof MATERIALS)[number];

export type BatchStatus = 'composting' | 'ready_for_test' | 'passed' | 'failed' | 'sent_to_nursery';

export type MixPct = 0 | 25 | 50;
export const MIX_PCTS: readonly MixPct[] = [0, 25, 50];

export type SpeciesId = 'meranti' | 'tembusu' | 'angsana' | 'kelat';

export interface Species {
  id: SpeciesId;
  common: string;
  scientific: string;
}

export interface Intake {
  id: string;
  date: string;
  source: IntakeSource;
  material: Material;
  weightKg: number;
  collector: string;
  batchId?: string;
}

export interface TempReading {
  t: string;
  celsius: number;
}

export interface GerminationInput {
  seedsSample: number;
  seedsControl: number;
  rootLengthsSample: number[];
  rootLengthsControl: number[];
}

export interface TestResult extends GerminationInput {
  date: string;
  gi: number;
  passed: boolean;
}

export interface Batch {
  id: string;
  createdAt: string;
  intakeIds: string[];
  status: BatchStatus;
  tempReadings: TempReading[];
  testResult?: TestResult;
}

export interface MoistureReading {
  t: string;
  vwc: number;
}

export interface WeeklyRecord {
  week: number;
  heightCm: number;
  leafHealth: number;
  alive: number;
}

export type TrayLogKind = 'death' | 'pest' | 'watering';

export interface TrayLog {
  date: string;
  kind: TrayLogKind;
  note: string;
  count?: number;
}

export interface Tray {
  id: string;
  mixPct: MixPct;
  moisture: MoistureReading[];
  weekly: WeeklyRecord[];
  logs: TrayLog[];
}

export interface Trial {
  id: string;
  species: SpeciesId;
  batchId: string;
  startDate: string;
  trays: Tray[];
}

export interface Tree {
  id: string;
  species: SpeciesId;
  trayId: string;
  batchId: string;
  plantedAt?: string;
  location?: string;
}

export interface AppData {
  version: 1;
  intakes: Intake[];
  batches: Batch[];
  trials: Trial[];
  trees: Tree[];
}
