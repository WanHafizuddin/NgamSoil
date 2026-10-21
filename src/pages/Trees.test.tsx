import { screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { renderApp } from '../test/render';
import { buildSampleData, emptyData } from '../data/sampleData';
import { treeUrl } from '../lib/treeUrl';
import { formatKg } from '../lib/format';

const HEADLINE = "Grown with compost from your township's leaves";
const IDS = ['NS-T-0001', 'NS-T-0002', 'NS-T-0003', 'NS-T-0004', 'NS-T-0005', 'NS-T-0006'];

describe('TreesPage', () => {
  test('renders a QR code encoding each tree page', async () => {
    await renderApp({ route: '/trees' });
    for (const id of IDS) expect(screen.getByTitle(treeUrl(id))).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Open public page/ })[0]).toHaveAttribute('href', '/tree/NS-T-0001');
  });

  test('the QR link opens the matching public tree page', async () => {
    const { user } = await renderApp({ route: '/trees' });
    await user.click(screen.getAllByRole('link', { name: /Open public page/ })[0]);
    const total = buildSampleData().intakes.reduce((s, i) => s + i.weightKg, 0);
    expect(screen.getByRole('heading', { level: 1, name: 'Tembusu' })).toBeInTheDocument();
    expect(screen.getByText('NS-B-2026-001')).toBeInTheDocument();
    expect(screen.getByText(HEADLINE)).toBeInTheDocument();
    expect(screen.getByText(formatKg(total))).toBeInTheDocument();
    expect(screen.getByText('Sample data')).toBeInTheDocument();
  });

  test('adds a tree tag from a trial tray', async () => {
    const { user } = await renderApp({ route: '/trees' });
    await user.selectOptions(screen.getByLabelText('Seedling tray'), 'Tembusu · 25% compost · NS-TR-002');
    await user.type(screen.getByLabelText('Location (optional)'), 'Elmina Central Park, playground');
    await user.click(screen.getByRole('button', { name: 'Add tree' }));
    expect(screen.getByTitle(treeUrl('NS-T-0007'))).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Tree NS-T-0007 tagged');
  });

  test('shows an empty state', async () => {
    await renderApp({ route: '/trees', data: emptyData() });
    expect(screen.getByText('No trees tagged yet')).toBeInTheDocument();
  });
});

describe('PublicTreePage', () => {
  test('is open to the public role', async () => {
    await renderApp({ route: '/tree/NS-T-0001', role: 'public' });
    expect(screen.getByRole('heading', { level: 1, name: 'Tembusu' })).toBeInTheDocument();
    expect(screen.queryByText('Not available for this role')).not.toBeInTheDocument();
    expect(screen.getByText('Still growing in the Elmina nursery')).toBeInTheDocument();
  });

  test('a tree still in the nursery says so', async () => {
    await renderApp({ route: '/tree/NS-T-0003', role: 'public' });
    expect(screen.getByText('Still growing in the Elmina nursery')).toBeInTheDocument();
  });

  test('an unknown tree shows a friendly message', async () => {
    await renderApp({ route: '/tree/NS-T-9999', role: 'public' });
    expect(screen.getByRole('heading', { level: 1, name: 'Tree not found' })).toBeInTheDocument();
    expect(screen.getByText('Check the tag and try again.')).toBeInTheDocument();
    expect(screen.getByText(/only open on the device that created them/)).toBeInTheDocument();
  });

  test('a control-tray tree does not claim it grew in compost', async () => {
    await renderApp({ route: '/tree/NS-T-0006', role: 'public' });
    expect(screen.queryByText(HEADLINE)).not.toBeInTheDocument();
    expect(screen.getByText("A control tree in a trial of compost from your township's leaves")).toBeInTheDocument();
  });

  test('the journey describes the trial as preliminary', async () => {
    await renderApp({ route: '/tree/NS-T-0001', role: 'public' });
    expect(screen.getByText(/preliminary/i)).toBeInTheDocument();
    expect(screen.queryByText(/suited this species best/)).not.toBeInTheDocument();
  });

  test('a planted tree without a location says so', async () => {
    const data = buildSampleData();
    data.trees[2] = { ...data.trees[2], plantedAt: '2026-10-17' };
    await renderApp({ route: '/tree/NS-T-0003', role: 'public', data });
    expect(screen.getByText('Not recorded')).toBeInTheDocument();
  });
});

test('TreesPage explains where new tags work', async () => {
  await renderApp({ route: '/trees' });
  expect(screen.getByText(/saved in this browser only/)).toBeInTheDocument();
});
