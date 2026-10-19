import { describe, expect, test } from 'vitest';
import { activeAlerts, detectAlerts } from './alerts';
import { generateTempReadings, type TempOptions } from '../sim/temperature';
import { addHours } from './dates';
import type { Batch, BatchStatus } from '../types';

const start = '2026-10-01T00:00:00.000Z';

function batch(extra: Partial<TempOptions> = {}, status: BatchStatus = 'composting'): Batch {
  return {
    id: 'NS-B-2026-009',
    createdAt: start,
    intakeIds: [],
    status,
    tempReadings: generateTempReadings({ start, end: addHours(start, 20 * 24), seed: 8, peak: 60, ...extra }),
  };
}

describe('detectAlerts', () => {
  test('a healthy curve has no alerts', () => {
    expect(detectAlerts(batch())).toEqual([]);
  });

  test('a cold dip in the active phase gives one too_cold alert', () => {
    const alerts = detectAlerts(batch({ dips: [{ fromHour: 300, hours: 6, celsius: 37 }] }));
    expect(alerts).toHaveLength(1);
    expect(alerts[0].kind).toBe('too_cold');
    expect(alerts[0].at).toBe(addHours(start, 300));
    expect(alerts[0].message).toContain('°C during the active phase');
  });

  test('cold readings during the rise phase are not alerts', () => {
    expect(detectAlerts(batch({ dips: [{ fromHour: 10, hours: 6, celsius: 35 }] }))).toEqual([]);
  });

  test('too hot readings give a too_hot alert', () => {
    const alerts = detectAlerts(batch({ dips: [{ fromHour: 200, hours: 2, celsius: 72 }] }));
    expect(alerts.map((a) => a.kind)).toEqual(['too_hot']);
  });

  test('a gap over 2 h gives a sensor_offline alert', () => {
    const alerts = detectAlerts(batch({ gaps: [{ fromHour: 200, hours: 3 }] }));
    expect(alerts.map((a) => a.kind)).toEqual(['sensor_offline']);
    expect(alerts[0].message).toBe('Sensor offline for 3.5 h');
  });

  test('batches with 0 or 1 readings have no alerts', () => {
    expect(detectAlerts({ ...batch(), tempReadings: [] })).toEqual([]);
    expect(detectAlerts({ ...batch(), tempReadings: [{ t: start, celsius: 10 }] })).toEqual([]);
  });
});

test('activeAlerts only covers composting batches', () => {
  const cold = { dips: [{ fromHour: 300, hours: 6, celsius: 37 }] };
  expect(activeAlerts([batch(cold, 'failed')])).toEqual([]);
  expect(activeAlerts([batch(cold, 'composting')])).toHaveLength(1);
});
