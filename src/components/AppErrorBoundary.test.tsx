import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, test, vi } from 'vitest';
import { AppErrorBoundary, clearStoredData } from './AppErrorBoundary';
import { STORAGE_KEY } from '../state/storage';

afterEach(() => vi.restoreAllMocks());

function Boom(): JSX.Element {
  throw new Error('bad data');
}

test('shows a way back when a screen crashes', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const onReset = vi.fn();
  render(
    <AppErrorBoundary onReset={onReset}>
      <Boom />
    </AppErrorBoundary>,
  );
  expect(screen.getByRole('heading', { name: 'Something went wrong' })).toBeInTheDocument();
  await userEvent.setup().click(screen.getByRole('button', { name: 'Reset to sample data' }));
  expect(onReset).toHaveBeenCalledOnce();
});

test('clearStoredData removes the saved demo data', () => {
  localStorage.setItem(STORAGE_KEY, '{"version":1}');
  clearStoredData();
  expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
});
