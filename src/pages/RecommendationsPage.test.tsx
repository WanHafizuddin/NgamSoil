import { screen, within } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { renderApp } from '../test/render';

const card = (name: string) => within(screen.getByRole('article', { name }));

describe('RecommendationsPage', () => {
  test('recommends 25% compost for Tembusu', () => {
    renderApp({ route: '/recommendations' });
    const tembusu = card('Tembusu');
    expect(tembusu.getByText('Best mix: 25% compost')).toBeInTheDocument();
    expect(tembusu.getByText('Preliminary')).toBeInTheDocument();
    expect(tembusu.getByText('Sample data')).toBeInTheDocument();
    expect(tembusu.getByText('3 trays · 6 weeks')).toBeInTheDocument();
    expect(tembusu.getByText(/^25% compost grew/)).toBeInTheDocument();
    expect(tembusu.getAllByRole('listitem')).toHaveLength(3);
  });

  test('recommends 25% compost for Meranti', () => {
    renderApp({ route: '/recommendations' });
    expect(card('Meranti').getByText('Best mix: 25% compost')).toBeInTheDocument();
  });

  test('species without trials say so', () => {
    renderApp({ route: '/recommendations' });
    expect(card('Angsana').getByText('No trial data yet')).toBeInTheDocument();
    expect(card('Pokok Kelat').getByText('No trial data yet')).toBeInTheDocument();
  });

  test('explains the rule and its limits', () => {
    renderApp({ route: '/recommendations' });
    expect(screen.getByText('Updates as more batches and trials are added.')).toBeInTheDocument();
    expect(screen.getByText(/height growth 50%, leaf health 30%, survival 20%/)).toBeInTheDocument();
    expect(screen.getByText(/preliminary until the 3-month Elmina nursery pilot ends/)).toBeInTheDocument();
  });
});
