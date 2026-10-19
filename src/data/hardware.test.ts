import { expect, test } from 'vitest';
import { HARDWARE, HARDWARE_BUDGET_RM, hardwareTotal } from './hardware';

test('prototype hardware stays under the RM200 budget', () => {
  expect(hardwareTotal()).toBe(157);
  expect(hardwareTotal()).toBeLessThan(HARDWARE_BUDGET_RM);
});

test('includes the spec sensors', () => {
  const items = HARDWARE.map((h) => h.item).join(' ');
  expect(items).toMatch(/ESP32/);
  expect(items).toMatch(/DS18B20/);
  expect(items).toMatch(/Capacitive soil moisture/);
});
