import type { BatchStatus, Material, MixPct } from '../types';
import { TIME_ZONE } from './dates';

function toDate(isoOrDate: string): Date {
  return new Date(isoOrDate.length === 10 ? `${isoOrDate}T00:00:00.000Z` : isoOrDate);
}

export function formatKg(kg: number): string {
  return `${Math.round(kg).toLocaleString('en-MY')} kg`;
}

export function formatDate(isoOrDate: string): string {
  return toDate(isoOrDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: TIME_ZONE,
  });
}

export function formatShortDate(isoOrDate: string): string {
  return toDate(isoOrDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: TIME_ZONE });
}

export function formatDateTime(iso: string): string {
  return toDate(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: TIME_ZONE,
  });
}

export function formatPct(fraction: number | null, digits = 0): string {
  return fraction === null ? '—' : `${(fraction * 100).toFixed(digits)}%`;
}

export function formatGI(gi: number | null): string {
  return gi === null ? '—' : `${gi.toFixed(1)}%`;
}

export const STATUS_LABEL: Record<BatchStatus, string> = {
  composting: 'Composting',
  ready_for_test: 'Ready for test',
  passed: 'Passed',
  failed: 'Failed',
  sent_to_nursery: 'Sent to nursery',
};

export const MATERIAL_LABEL: Record<Material, string> = {
  leaves: 'Leaves',
  branches: 'Branches',
  grass: 'Grass',
};

export function mixLabel(mix: MixPct): string {
  return mix === 0 ? '0% (control)' : `${mix}% compost`;
}
