import { screen, within } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { renderApp } from '../test/render';
import { buildSampleData } from '../data/sampleData';
import { computeKpis } from '../lib/kpis';
import { formatKg } from '../lib/format';

afterEach(() => vi.restoreAllMocks());

const alertLinks = () => within(screen.getByRole('list', { name: 'Alerts' })).getAllByRole('link');

describe('DashboardPage', () => {
  test('shows KPIs from the sample data', () => {
    renderApp();
    const k = computeKpis(buildSampleData());
    expect(screen.getByText(formatKg(k.wasteDivertedKg))).toBeInTheDocument();
    expect(screen.getByText(formatKg(k.estimatedSoilSavedKg))).toBeInTheDocument();
    expect(screen.getByText('2 active · 1 passed · 1 failed')).toBeInTheDocument();
    expect(screen.getByText('64')).toBeInTheDocument();
    expect(screen.getByText('89%')).toBeInTheDocument();
    expect(screen.getAllByText('Sample data').length).toBeGreaterThan(0);
  });

  test('lists active alerts linked to their batch', () => {
    renderApp();
    expect(alertLinks()).toHaveLength(2);
    for (const link of alertLinks()) expect(link).toHaveAttribute('href', '/batches/NS-B-2026-004');
  });

  test('clear and reset the data', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { user } = renderApp();

    await user.click(screen.getByRole('button', { name: 'Clear all data' }));
    expect(screen.getAllByText('0 kg')).toHaveLength(2);
    expect(screen.getByText('No intakes yet')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.getByText('No alerts. All active piles are within range.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Reset to sample data' }));
    expect(alertLinks()).toHaveLength(2);
  });

  test('cancelling the confirm keeps the data', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const { user } = renderApp();
    await user.click(screen.getByRole('button', { name: 'Clear all data' }));
    expect(alertLinks()).toHaveLength(2);
  });
});
