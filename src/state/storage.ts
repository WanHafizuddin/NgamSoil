import type { AppData, Role } from '../types';
import { buildSampleData } from '../data/sampleData';

export const STORAGE_KEY = 'rootloop:data:v1';
export const ROLE_KEY = 'rootloop:role';
const ROLES: Role[] = ['admin', 'staff', 'public'];

const isRecord = (item: unknown) =>
  typeof item === 'object' && item !== null && typeof (item as { id?: unknown }).id === 'string';

function isAppData(value: unknown): value is AppData {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    v.version === 1 &&
    ['intakes', 'batches', 'trials', 'trees'].every((k) => Array.isArray(v[k]) && (v[k] as unknown[]).every(isRecord))
  );
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (isAppData(parsed)) return parsed;
    }
  } catch {
    // Corrupt or unavailable storage falls back to the sample data.
  }
  return buildSampleData();
}

export function saveData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Quota exceeded or storage blocked: the demo keeps working in memory.
  }
}

export function loadRole(): Role {
  try {
    const raw = localStorage.getItem(ROLE_KEY);
    if (raw && (ROLES as string[]).includes(raw)) return raw as Role;
  } catch {
    // Storage blocked: use the default role.
  }
  return 'admin';
}

export function saveRole(role: Role): void {
  try {
    localStorage.setItem(ROLE_KEY, role);
  } catch {
    // Storage blocked: the role lasts for this page view only.
  }
}
