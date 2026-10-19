import { screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { renderApp } from '../test/render';
import { buildSampleData, emptyData } from '../data/sampleData';
import { treeUrl } from '../lib/treeUrl';
import { formatKg } from '../lib/format';

const HEADLINE = "Grown with compost from your township's leaves";
const IDS = ['RL-T-0001', 'RL-T-0002', 'RL-T-0003', 'RL-T-0004', 'RL-T-0005', 'RL-T-0006'];

describe('TreesPage', () => {
  test('renders a QR code encoding each tree page', () => {
    renderApp({ route: '/trees' });
    for (const id of IDS) expect(screen.getByTitle(treeUrl(id))).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Open public page/ })[0]).toHaveAttribute('href', '/tree/RL-T-0001');
  });

  test('the QR link opens the matching public tree page', async () => {
    const { user } = renderApp({ route: '/trees' });
    await user.click(screen.getAllByRole('link', { name: /Open public page/ })[0]);
    const total = buildSampleData().intakes.reduce((s, i) => s + i.weightKg, 0);
    expect(screen.getByRole('heading', { level: 1, name: 'Tembusu' })).toBeInTheDocument();
    expect(screen.getByText('RL-B-2026-001')).toBeInTheDocument();
    expect(screen.getByText(HEADLINE)).toBeInTheDocument();
    expect(screen.getByText(formatKg(total))).toBeInTheDocument();
    expect(screen.getByText('Sample data')).toBeInTheDocument();
  });

  test('adds a tree tag from a trial tray', async () => {
    const { user } = renderApp({ route: '/trees' });
    await user.selectOptions(screen.getByLabelText('Seedling tray'), 'Tembusu · 25% compost · RL-TR-002');
    await user.type(screen.getByLabelText('Location (optional)'), 'Elmina Central Park, playground');
    await user.click(screen.getByRole('button', { name: 'Add tree' }));
    expect(screen.getByTitle(treeUrl('RL-T-0007'))).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Tree RL-T-0007 tagged');
  });

  test('shows an empty state', () => {
    renderApp({ route: '/trees', data: emptyData() });
    expect(screen.getByText('No trees tagged yet')).toBeInTheDocument();
  });
});

describe('PublicTreePage', () => {
  test('is open to the public role', () => {
    renderApp({ route: '/tree/RL-T-0001', role: 'public' });
    expect(screen.getByRole('heading', { level: 1, name: 'Tembusu' })).toBeInTheDocument();
    expect(screen.queryByText('Not available for this role')).not.toBeInTheDocument();
    expect(screen.getByText('Elmina Central Park, east lawn')).toBeInTheDocument();
  });

  test('a tree still in the nursery says so', () => {
    renderApp({ route: '/tree/RL-T-0003', role: 'public' });
    expect(screen.getByText('Still growing in the Elmina nursery')).toBeInTheDocument();
  });

  test('an unknown tree shows a friendly message', () => {
    renderApp({ route: '/tree/RL-T-9999', role: 'public' });
    expect(screen.getByRole('heading', { level: 1, name: 'Tree not found' })).toBeInTheDocument();
    expect(screen.getByText('Check the tag and try again.')).toBeInTheDocument();
    expect(screen.getByText(/only open on the device that created them/)).toBeInTheDocument();
  });

  test('a control-tray tree does not claim it grew in compost', () => {
    renderApp({ route: '/tree/RL-T-0006', role: 'public' });
    expect(screen.queryByText(HEADLINE)).not.toBeInTheDocument();
    expect(screen.getByText("A control tree in a trial of compost from your township's leaves")).toBeInTheDocument();
  });

  test('the journey describes the trial as preliminary', () => {
    renderApp({ route: '/tree/RL-T-0001', role: 'public' });
    expect(screen.getByText(/preliminary/i)).toBeInTheDocument();
    expect(screen.queryByText(/suited this species best/)).not.toBeInTheDocument();
  });

  test('a planted tree without a location says so', () => {
    const data = buildSampleData();
    data.trees[2] = { ...data.trees[2], plantedAt: '2026-10-17' };
    renderApp({ route: '/tree/RL-T-0003', role: 'public', data });
    expect(screen.getByText('Not recorded')).toBeInTheDocument();
  });
});

test('TreesPage explains where new tags work', () => {
  renderApp({ route: '/trees' });
  expect(screen.getByText(/saved in this browser only/)).toBeInTheDocument();
});
