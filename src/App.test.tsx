import { screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { renderApp } from './test/render';
import { emptyData } from './data/sampleData';

// [route, h1 with sample data, h1 with empty data]
const ROUTES: [string, string, string][] = [
  ['/', 'Dashboard', 'Dashboard'],
  ['/intake', 'Waste intake', 'Waste intake'],
  ['/batches', 'Compost batches', 'Compost batches'],
  ['/trials', 'Nursery trials', 'Nursery trials'],
  ['/recommendations', 'Recommendations', 'Recommendations'],
  ['/trees', 'Tree QR tags', 'Tree QR tags'],
  ['/about', 'About RootLoop', 'About RootLoop'],
  ['/nope', 'Page not found', 'Page not found'],
  ['/batches/RL-B-2026-001', 'RL-B-2026-001', 'Batch not found'],
  ['/batches/RL-B-2026-003/test', 'Maturity test', 'Batch not found'],
];

describe.each(ROUTES)('route %s', (route, withSample, withEmpty) => {
  test('renders with sample data', () => {
    renderApp({ route });
    expect(screen.getByRole('heading', { level: 1, name: withSample })).toBeInTheDocument();
  });

  test('renders with empty data', () => {
    renderApp({ route, data: emptyData() });
    expect(screen.getByRole('heading', { level: 1, name: withEmpty })).toBeInTheDocument();
  });
});

describe('roles', () => {
  test('admin sees every module in the navigation', () => {
    renderApp();
    expect(screen.getAllByRole('link', { name: 'Recommendations' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: 'Tree tags' }).length).toBeGreaterThan(0);
  });

  test('staff cannot open the dashboard', () => {
    renderApp({ role: 'staff' });
    expect(screen.getByRole('heading', { level: 1, name: 'Not available for this role' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Dashboard' })).not.toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Intake' }).length).toBeGreaterThan(0);
  });

  test('public is pointed to a tree page', () => {
    renderApp({ role: 'public', route: '/intake' });
    expect(screen.getByRole('heading', { level: 1, name: 'Not available for this role' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open an example tree page' })).toHaveAttribute('href', '/tree/RL-T-0001');
  });

  test('switching role goes to that role’s home screen', async () => {
    const { user } = renderApp();
    await user.selectOptions(screen.getByLabelText('Demo role'), 'Staff (nursery)');
    expect(screen.getByRole('heading', { level: 1, name: 'Waste intake' })).toBeInTheDocument();
  });
});
