import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '../App';
import { DataProvider } from '../state/DataContext';
import { RoleProvider } from '../state/RoleContext';
import { buildSampleData } from '../data/sampleData';
import type { AppData, Role } from '../types';

export function renderApp(opts: { route?: string; data?: AppData; role?: Role; user?: ReturnType<typeof userEvent.setup> } = {}) {
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
  return { ...result, user };
}
