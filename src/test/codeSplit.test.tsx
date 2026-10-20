import { screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { renderApp } from './render';

// Records which heavy libraries get imported. Tests run in order: the public
// tree page is checked before any chart page has loaded them.
const loaded = vi.hoisted(() => new Set<string>());

vi.mock('recharts', async (importOriginal) => {
  loaded.add('recharts');
  return importOriginal();
});

vi.mock('qrcode.react', async (importOriginal) => {
  loaded.add('qrcode.react');
  return importOriginal();
});

test('the public tree page loads without the chart and QR libraries', async () => {
  await renderApp({ route: '/tree/NS-T-0001' });
  expect(screen.getByRole('heading', { level: 1, name: 'Tembusu' })).toBeInTheDocument();
  expect([...loaded]).toEqual([]);
});

test('opening a chart page loads the chart library', async () => {
  await renderApp({ route: '/' });
  expect(screen.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeInTheDocument();
  expect(loaded).toContain('recharts');
});
