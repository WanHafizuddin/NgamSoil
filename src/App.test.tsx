import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, test } from 'vitest';
import { AppRoutes } from './App';

test('renders the RootLoop heading', () => {
  render(
    <MemoryRouter>
      <AppRoutes />
    </MemoryRouter>,
  );
  expect(screen.getByRole('heading', { name: 'RootLoop' })).toBeInTheDocument();
});
