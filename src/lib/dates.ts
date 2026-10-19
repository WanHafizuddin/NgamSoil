export const TIME_ZONE = 'Asia/Kuala_Lumpur';
const HOUR_MS = 3_600_000;

function parseDay(date: string): number {
  return Date.parse(`${date.slice(0, 10)}T00:00:00.000Z`);
}

export function addHours(iso: string, hours: number): string {
  return new Date(Date.parse(iso) + hours * HOUR_MS).toISOString();
}

export function addDays(date: string, days: number): string {
  return new Date(parseDay(date) + days * 24 * HOUR_MS).toISOString().slice(0, 10);
}

export function hoursBetween(aIso: string, bIso: string): number {
  return (Date.parse(bIso) - Date.parse(aIso)) / HOUR_MS;
}

export function weekStart(date: string): string {
  const day = new Date(parseDay(date)).getUTCDay();
  return addDays(date, -((day + 6) % 7));
}

export function toLocalDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-CA', { timeZone: TIME_ZONE });
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function todayLocal(): string {
  return toLocalDate(nowIso());
}
