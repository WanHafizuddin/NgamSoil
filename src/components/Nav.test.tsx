import { act, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { renderApp } from '../test/render';

const more = () => screen.getByRole('button', { name: 'More' });

describe('bottom nav More menu', () => {
  test('the More button toggles the menu', async () => {
    const { user } = await renderApp();
    await user.click(more());
    expect(more()).toHaveAttribute('aria-expanded', 'true');
    await user.click(more());
    expect(more()).toHaveAttribute('aria-expanded', 'false');
  });

  test('closes on a click outside the menu', async () => {
    const { user } = await renderApp();
    await user.click(more());
    await user.click(screen.getByRole('heading', { level: 1, name: 'Dashboard' }));
    expect(more()).toHaveAttribute('aria-expanded', 'false');
  });

  test('stays open on a click inside the menu', async () => {
    const { user } = await renderApp();
    await user.click(more());
    await user.click(screen.getByRole('list', { name: 'More pages' }));
    expect(more()).toHaveAttribute('aria-expanded', 'true');
  });

  test('closes on Escape while focus is elsewhere', async () => {
    const { user } = await renderApp();
    await user.click(more());
    act(() => screen.getByLabelText('Demo role').focus());
    await user.keyboard('{Escape}');
    expect(more()).toHaveAttribute('aria-expanded', 'false');
  });
});
