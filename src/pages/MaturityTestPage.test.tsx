import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { renderApp } from '../test/render';
import { simulateGerminationAnalysis } from '../sim/ai';
import { hashString } from '../lib/random';
import { computeGI, isPass } from '../lib/gi';

const NOTE = 'This test shows compost maturity, not that it is free of pathogens.';

afterEach(() => vi.useRealTimers());

describe('MaturityTestPage', () => {
  test('uploads, analyses and saves a result', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    await renderApp({ route: '/batches/NS-B-2026-003/test', user });

    expect(screen.getByText(NOTE)).toBeInTheDocument();
    const analyse = screen.getByRole('button', { name: 'Analyse' });
    expect(analyse).toBeDisabled();

    await user.upload(screen.getByLabelText('Germination test photo'), new File(['x'], 'g.jpg', { type: 'image/jpeg' }));
    expect(screen.getByAltText('Uploaded photo preview')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Analyse' }));
    expect(screen.getByRole('button', { name: 'Analysing…' })).toBeDisabled();

    await act(() => vi.advanceTimersByTimeAsync(2000));
    expect(screen.getByText('Germination Index')).toBeInTheDocument();
    expect(screen.getByText(NOTE)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Save result' }));
    const passed = isPass(computeGI(simulateGerminationAnalysis(hashString('NS-B-2026-003'))));
    expect(await screen.findByRole('heading', { level: 1, name: 'NS-B-2026-003' })).toBeInTheDocument();
    expect(screen.getByRole('listitem', { current: 'step' })).toHaveTextContent(passed ? 'Passed' : 'Failed');
  });

  test('cannot save while a root length is blank', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    await renderApp({ route: '/batches/NS-B-2026-003/test', user });

    await user.upload(screen.getByLabelText('Germination test photo'), new File(['x'], 'g.jpg', { type: 'image/jpeg' }));
    await user.click(screen.getByRole('button', { name: 'Analyse' }));
    await act(() => vi.advanceTimersByTimeAsync(2000));
    const save = screen.getByRole('button', { name: 'Save result' });
    expect(save).toBeEnabled();

    const cell = screen.getByLabelText('Sample seed 1 root length (mm)');
    await user.clear(cell);
    expect(save).toBeDisabled();

    await user.type(cell, '30');
    expect(save).toBeEnabled();
  });

  test('asks for the batch to be marked ready first', async () => {
    await renderApp({ route: '/batches/NS-B-2026-004/test' });
    expect(screen.getByText('Mark this batch ready for test first.')).toBeInTheDocument();
    expect(screen.getByText(NOTE)).toBeInTheDocument();
  });

  test('shows the saved result for a tested batch', async () => {
    await renderApp({ route: '/batches/NS-B-2026-001/test' });
    expect(screen.getByText('GI 92.0%')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Analyse' })).not.toBeInTheDocument();
  });
});
