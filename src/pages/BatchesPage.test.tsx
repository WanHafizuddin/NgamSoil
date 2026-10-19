import { render, screen, within } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { renderApp } from '../test/render';
import { buildSampleData, emptyData } from '../data/sampleData';
import { formatKg } from '../lib/format';
import { TempChart } from '../components/charts/TempChart';

describe('BatchesPage', () => {
  test('lists every batch with its status', () => {
    renderApp({ route: '/batches' });
    for (const id of ['RL-B-2026-001', 'RL-B-2026-002', 'RL-B-2026-003', 'RL-B-2026-004']) {
      expect(screen.getByRole('link', { name: new RegExp(id) })).toHaveAttribute('href', `/batches/${id}`);
    }
    for (const label of ['Composting', 'Ready for test', 'Sent to nursery', 'Failed']) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    expect(screen.getByText('GI 92.0%')).toBeInTheDocument();
  });

  test('shows an empty state', () => {
    renderApp({ route: '/batches', data: emptyData() });
    expect(screen.getByText('No batches yet')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Log an intake' })).toHaveAttribute('href', '/intake');
  });
});

describe('BatchDetailPage', () => {
  test('shows alerts and total input for the composting batch', () => {
    renderApp({ route: '/batches/RL-B-2026-004' });
    const data = buildSampleData();
    const kg = data.intakes.filter((i) => i.batchId === 'RL-B-2026-004').reduce((s, i) => s + i.weightKg, 0);
    expect(screen.getByText(/Too cold/)).toBeInTheDocument();
    expect(screen.getByText(/Sensor offline/)).toBeInTheDocument();
    expect(screen.getByText('Total input')).toBeInTheDocument();
    expect(screen.getByText(formatKg(kg))).toBeInTheDocument();
    expect(within(screen.getByRole('list', { name: 'Linked intakes' })).getAllByRole('listitem')).toHaveLength(6);
  });

  test('marks a batch ready for test', async () => {
    const { user } = renderApp({ route: '/batches/RL-B-2026-004' });
    expect(screen.getByRole('listitem', { current: 'step' })).toHaveTextContent('Composting');
    await user.click(screen.getByRole('button', { name: 'Mark ready for test' }));
    expect(screen.getByRole('listitem', { current: 'step' })).toHaveTextContent('Ready for test');
    expect(screen.getByRole('link', { name: 'Run maturity test' })).toHaveAttribute('href', '/batches/RL-B-2026-004/test');
    expect(screen.queryByRole('button', { name: 'Mark ready for test' })).not.toBeInTheDocument();
  });

  test('shows the saved maturity test', () => {
    renderApp({ route: '/batches/RL-B-2026-001' });
    expect(screen.getByText('GI 92.0%')).toBeInTheDocument();
    expect(screen.getByText('Pass')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Start a nursery trial' })).toHaveAttribute('href', '/trials?batch=RL-B-2026-001');
  });

  test('a batch without alerts says so', () => {
    renderApp({ route: '/batches/RL-B-2026-003' });
    expect(screen.getByText('No alerts for this batch')).toBeInTheDocument();
  });
});

test('TempChart shows an empty state below 2 readings', () => {
  render(<TempChart readings={[{ t: '2026-10-19T00:00:00.000Z', celsius: 30 }]} />);
  expect(screen.getByText('No readings yet')).toBeInTheDocument();
});
