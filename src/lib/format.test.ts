import { expect, test } from 'vitest';
import { formatDate, formatGI, formatKg, formatPct, formatShortDate, mixLabel, STATUS_LABEL } from './format';
import { addDays, addHours, hoursBetween, toLocalDate, weekStart } from './dates';

test('formatKg rounds and groups thousands', () => {
  expect(formatKg(1204.4)).toBe('1,204 kg');
  expect(formatKg(0)).toBe('0 kg');
});

test('formatGI shows one decimal or a dash', () => {
  expect(formatGI(92)).toBe('92.0%');
  expect(formatGI(null)).toBe('—');
});

test('formatPct handles fractions and null', () => {
  expect(formatPct(64 / 72)).toBe('89%');
  expect(formatPct(null)).toBe('—');
});

test('formatDate and formatShortDate use Malaysian dates', () => {
  expect(formatDate('2026-10-19')).toBe('19 Oct 2026');
  expect(formatDate('2026-10-18T17:00:00.000Z')).toBe('19 Oct 2026');
  expect(formatShortDate('2026-10-12')).toBe('12 Oct');
});

test('labels', () => {
  expect(STATUS_LABEL.sent_to_nursery).toBe('Sent to nursery');
  expect(mixLabel(0)).toBe('0% (control)');
  expect(mixLabel(25)).toBe('25% compost');
});

test('weekStart maps any day to its Monday', () => {
  expect(weekStart('2026-10-18')).toBe('2026-10-12');
  expect(weekStart('2026-10-12')).toBe('2026-10-12');
});

test('toLocalDate converts UTC to Asia/Kuala_Lumpur', () => {
  expect(toLocalDate('2026-10-18T17:00:00.000Z')).toBe('2026-10-19');
});

test('date arithmetic', () => {
  expect(addHours('2026-10-01T00:00:00.000Z', 30)).toBe('2026-10-02T06:00:00.000Z');
  expect(addDays('2026-09-07', 7)).toBe('2026-09-14');
  expect(hoursBetween('2026-10-01T00:00:00.000Z', '2026-10-01T03:30:00.000Z')).toBe(3.5);
});
