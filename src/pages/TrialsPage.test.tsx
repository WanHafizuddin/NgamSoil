import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { renderApp } from '../test/render';
import { emptyData } from '../data/sampleData';

afterEach(() => vi.useRealTimers());

const lastRowCells = () => {
  const rows = within(screen.getByRole('table', { name: 'Weekly records' })).getAllByRole('row');
  return within(rows[rows.length - 1]).getAllByRole('cell');
};

describe('TrialsPage', () => {
  test('lists the sample trials', () => {
    renderApp({ route: '/trials' });
    expect(screen.getByRole('link', { name: /Meranti/ })).toHaveAttribute('href', '/trials/RL-TR-001');
    expect(screen.getByRole('link', { name: /Tembusu/ })).toHaveAttribute('href', '/trials/RL-TR-002');
  });

  test('offers only batches that passed the maturity test', () => {
    renderApp({ route: '/trials?batch=RL-B-2026-001' });
    const select = screen.getByLabelText('Compost batch');
    expect(select).toHaveValue('RL-B-2026-001');
    const options = within(select).getAllByRole('option').map((o) => o.textContent);
    expect(options).toEqual(['RL-B-2026-001 · GI 92.0%']);
  });

  test('creates a trial with three trays', async () => {
    const { user } = renderApp({ route: '/trials' });
    await user.selectOptions(screen.getByLabelText('Species'), 'Angsana');
    await user.click(screen.getByRole('button', { name: 'Start trial' }));

    expect(screen.getByRole('heading', { level: 1, name: 'Angsana trial' })).toBeInTheDocument();
    expect(screen.getAllByRole('tab').map((t) => t.textContent)).toEqual(['0% (control)', '25% compost', '50% compost']);
    expect(screen.getAllByText('No readings yet').length).toBeGreaterThan(0);
  });

  test('explains when no batch has passed', () => {
    renderApp({ route: '/trials', data: emptyData() });
    expect(screen.getByText('No trials yet')).toBeInTheDocument();
    expect(screen.getByText('No passed batches yet. Run a maturity test first.')).toBeInTheDocument();
  });
});

describe('TrialDetailPage', () => {
  test('adds a weekly record from a seedling photo', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderApp({ route: '/trials/RL-TR-002', user });

    await user.click(screen.getByRole('tab', { name: '25% compost' }));
    await user.upload(screen.getByLabelText('Weekly seedling photo'), new File(['x'], 's.jpg', { type: 'image/jpeg' }));
    await user.click(screen.getByRole('button', { name: 'Analyse' }));
    await act(() => vi.advanceTimersByTimeAsync(2000));

    expect(screen.getByRole('status')).toHaveTextContent('Week 7 added');
    expect(lastRowCells()[0]).toHaveTextContent('7');
  });

  test('a death log lowers the alive count', async () => {
    const { user } = renderApp({ route: '/trials/RL-TR-002' });
    await user.click(screen.getByRole('tab', { name: '25% compost' }));
    expect(lastRowCells()[3]).toHaveTextContent('12');

    await user.selectOptions(screen.getByLabelText('Log type'), 'Death');
    const count = screen.getByLabelText('Number of seedlings');
    await user.clear(count);
    await user.type(count, '2');
    await user.click(screen.getByRole('button', { name: 'Add log' }));

    expect(lastRowCells()[3]).toHaveTextContent('10');
  });

  test('a pest log needs a note', async () => {
    const { user } = renderApp({ route: '/trials/RL-TR-002' });
    await user.selectOptions(screen.getByLabelText('Log type'), 'Pest');
    await user.click(screen.getByRole('button', { name: 'Add log' }));
    expect(screen.getByText('Describe what you saw')).toBeInTheDocument();
  });
});
