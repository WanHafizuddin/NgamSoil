import { screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { renderApp } from '../test/render';

test('About shows the pitch, SDP fit, hardware budget and pilot plan', async () => {
  await renderApp({ route: '/about' });
  expect(screen.getByText("Others ask if compost is ready. We ask if it's right for this tree.")).toBeInTheDocument();
  expect(screen.getByText(/190,000\+ trees planted/)).toBeInTheDocument();
  expect(screen.getByText(/RM 157/)).toBeInTheDocument();
  expect(screen.getByRole('table', { name: 'Prototype hardware' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /Pilot plan/ })).toBeInTheDocument();
  expect(screen.getByRole('list', { name: 'How NgamSoil works' }).children).toHaveLength(6);
});
