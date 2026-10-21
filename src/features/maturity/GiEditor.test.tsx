import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { GiEditor } from './GiEditor';

const CONTROL = [38, 42, 40, 41, 39, 40, 43, 37, 40, 40];
const PASS = { seedsSample: 10, seedsControl: 10, rootLengthsSample: [36, 38, 35, 37, 39, 36, 37, 38, 36, 36], rootLengthsControl: CONTROL };
const FAIL = { seedsSample: 8, seedsControl: 10, rootLengthsSample: [30, 34, 31, 33, 32, 29, 35, 32], rootLengthsControl: CONTROL };

describe('GiEditor', () => {
  test('shows GI and verdict for a passing sample', () => {
    const onChange = vi.fn();
    render(<GiEditor initial={PASS} onChange={onChange} />);
    expect(screen.getByText('92.0%')).toBeInTheDocument();
    expect(screen.getByText('Pass')).toBeInTheDocument();
    expect(screen.getByText('Germinated: 10/10 sample, 10/10 control')).toBeInTheDocument();
    expect(screen.getByText('Mean root length: 36.8 mm sample vs 40.0 mm control')).toBeInTheDocument();
    expect(onChange).toHaveBeenLastCalledWith({ input: PASS, gi: 92 });
  });

  test('recalculates GI live when a root length is edited', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<GiEditor initial={PASS} onChange={onChange} />);
    const cell = screen.getByLabelText('Sample seed 1 root length (mm)');
    await user.clear(cell);
    await user.type(cell, '4');
    expect(screen.getByText('84.0%')).toBeInTheDocument();
    expect(screen.getByText('Pass')).toBeInTheDocument();
    expect(onChange).toHaveBeenLastCalledWith({ input: { ...PASS, rootLengthsSample: [4, ...PASS.rootLengthsSample.slice(1)] }, gi: 84 });
  });

  test('shows a failing sample', () => {
    render(<GiEditor initial={FAIL} onChange={() => {}} />);
    expect(screen.getByText('64.0%')).toBeInTheDocument();
    expect(screen.getByText('Fail')).toBeInTheDocument();
  });

  test('flags an empty cell and reports no result', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<GiEditor initial={PASS} onChange={onChange} />);
    const cell = screen.getByLabelText('Control seed 3 root length (mm)');
    await user.clear(cell);
    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.getByText('Enter a length of 0 mm or more')).toBeInTheDocument();
    expect(cell).toHaveAttribute('aria-invalid', 'true');
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  test('links the error message to the invalid cells only', async () => {
    const user = userEvent.setup();
    render(<GiEditor initial={PASS} onChange={() => {}} />);
    const cell = screen.getByLabelText('Control seed 3 root length (mm)');
    await user.clear(cell);
    expect(cell).toHaveAccessibleDescription('Enter a length of 0 mm or more');
    expect(screen.getByLabelText('Control seed 4 root length (mm)')).not.toHaveAccessibleDescription();
  });

  test('explains why GI is blank when every control root is 0 mm', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<GiEditor initial={PASS} onChange={onChange} />);
    for (let i = 1; i <= CONTROL.length; i++) {
      const cell = screen.getByLabelText(`Control seed ${i} root length (mm)`);
      await user.clear(cell);
      await user.type(cell, '0');
    }
    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.getByText('Control roots must be longer than 0 mm')).toBeInTheDocument();
    expect(screen.getByLabelText('Control seed 1 root length (mm)')).toHaveAccessibleDescription('Control roots must be longer than 0 mm');
    expect(screen.getByLabelText('Sample seed 1 root length (mm)')).not.toHaveAccessibleDescription();
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  test('flags a negative value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<GiEditor initial={PASS} onChange={onChange} />);
    const cell = screen.getByLabelText('Sample seed 2 root length (mm)');
    await user.clear(cell);
    await user.type(cell, '-3');
    expect(screen.getByText('—')).toBeInTheDocument();
    expect(onChange).toHaveBeenLastCalledWith(null);
  });
});
