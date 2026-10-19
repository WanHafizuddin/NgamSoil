import { fireEvent, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { renderApp } from '../test/render';

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-10-19T02:00:00Z'));
});
afterEach(() => vi.useRealTimers());

const logItems = () => within(screen.getByRole('list', { name: 'Intake log' })).getAllByRole('listitem');

describe('IntakePage', () => {
  test('logs a new intake', async () => {
    const { user } = renderApp({ route: '/intake' });
    expect(screen.getByLabelText('Date')).toHaveValue('2026-10-19');
    await user.type(screen.getByLabelText('Weight (kg)'), '25');
    await user.type(screen.getByLabelText('Collector'), 'Aiman');
    await user.click(screen.getByRole('button', { name: 'Log intake' }));

    expect(screen.getByRole('status')).toHaveTextContent('Intake RL-I-0023 logged');
    expect(logItems()).toHaveLength(23);
    expect(logItems()[0]).toHaveTextContent('Aiman');
    expect(logItems()[0]).toHaveTextContent('25 kg');
    expect(screen.getByLabelText('Collector')).toHaveValue('');
  });

  test('shows validation errors and logs nothing', async () => {
    const { user } = renderApp({ route: '/intake' });
    await user.type(screen.getByLabelText('Weight (kg)'), '0');
    await user.click(screen.getByRole('button', { name: 'Log intake' }));

    expect(screen.getByText('Weight must be more than 0 kg')).toBeInTheDocument();
    expect(screen.getByText("Enter the collector's name")).toBeInTheDocument();
    expect(screen.getByLabelText('Weight (kg)')).toHaveAttribute('aria-invalid', 'true');
    expect(logItems()).toHaveLength(22);
  });

  test('rejects a future date', async () => {
    const { user } = renderApp({ route: '/intake' });
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-10-20' } });
    await user.type(screen.getByLabelText('Weight (kg)'), '10');
    await user.type(screen.getByLabelText('Collector'), 'Siti');
    await user.click(screen.getByRole('button', { name: 'Log intake' }));
    expect(screen.getByText("Date can't be in the future")).toBeInTheDocument();
    expect(logItems()).toHaveLength(22);
  });

  test('groups selected intakes into a new batch', async () => {
    const { user } = renderApp({ route: '/intake' });
    expect(screen.queryByLabelText('Select RL-I-0001')).not.toBeInTheDocument();
    const create = () => screen.getByRole('button', { name: /Create batch from/ });
    expect(create()).toBeDisabled();

    await user.click(screen.getByLabelText('Select RL-I-0021'));
    await user.click(screen.getByLabelText('Select RL-I-0022'));
    expect(create()).toHaveAccessibleName('Create batch from 2 selected');
    await user.click(create());

    expect(screen.getByRole('heading', { level: 1, name: 'RL-B-2026-005' })).toBeInTheDocument();
  });

  test('each selection checkbox sits in a 44 px tap target', () => {
    renderApp({ route: '/intake' });
    const target = screen.getByLabelText('Select RL-I-0021').closest('label');
    expect(target).not.toBeNull();
    expect(target).toHaveClass('h-11', 'w-11');
  });

  test('shows an empty state without intakes', () => {
    renderApp({ route: '/intake', data: { version: 1, intakes: [], batches: [], trials: [], trees: [] } });
    expect(screen.getByText('No intakes yet')).toBeInTheDocument();
  });
});
