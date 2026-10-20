import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { expect } from 'vitest';
import { AppRoutes } from '../App';
import { DataProvider } from '../state/DataContext';
import { RoleProvider } from '../state/RoleContext';
import { buildSampleData } from '../data/sampleData';
import type { AppData, Role } from '../types';

/** Waits until the lazily loaded route page has replaced the loading fallback. */
export async function pageLoaded() {
  await waitFor(() => expect(screen.queryByText('Loading…')).not.toBeInTheDocument());
}

export async function renderApp(opts: { route?: string; data?: AppData; role?: Role; user?: ReturnType<typeof userEvent.setup> } = {}) {
  const user = opts.user ?? userEvent.setup();
  const result = render(
    <DataProvider initialData={opts.data ?? buildSampleData()}>
      <RoleProvider initialRole={opts.role ?? 'admin'}>
        <MemoryRouter initialEntries={[opts.route ?? '/']}>
          <AppRoutes />
        </MemoryRouter>
      </RoleProvider>
    </DataProvider>,
  );
  await pageLoaded();
  return { ...result, user };
}
