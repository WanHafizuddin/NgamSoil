import type { Species, SpeciesId } from '../types';

export const SPECIES: readonly Species[] = [
  { id: 'meranti', common: 'Meranti', scientific: 'Shorea leprosula' },
  { id: 'tembusu', common: 'Tembusu', scientific: 'Fagraea fragrans' },
  { id: 'angsana', common: 'Angsana', scientific: 'Pterocarpus indicus' },
  { id: 'kelat', common: 'Pokok Kelat', scientific: 'Syzygium sp.' },
];

export function getSpecies(id: SpeciesId): Species {
  return SPECIES.find((s) => s.id === id)!;
}
