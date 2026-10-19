import { useState, type FormEvent } from 'react';
import type { TrayLogKind } from '../../types';
import { useData } from '../../state/DataContext';
import { todayLocal } from '../../lib/dates';
import { btnSecondary, fieldError, fieldInput, fieldLabel } from '../../components/ui';

const DEFAULT_NOTE: Record<TrayLogKind, string> = { death: 'Seedling died', pest: '', watering: 'Watered' };

export function TrayLogForm({ trialId, trayId }: { trialId: string; trayId: string }) {
  const { dispatch } = useData();
  const [kind, setKind] = useState<TrayLogKind>('watering');
  const [note, setNote] = useState('');
  const [count, setCount] = useState('1');
  const [error, setError] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const text = note.trim() || DEFAULT_NOTE[kind];
    const deaths = Number(count);
    if (!text) return setError('Describe what you saw');
    if (kind === 'death' && !(Number.isInteger(deaths) && deaths >= 1)) return setError('Enter at least 1 seedling');

    setError('');
    dispatch({
      type: 'addTrayLog',
      trialId,
      trayId,
      log: { date: todayLocal(), kind, note: text, ...(kind === 'death' ? { count: deaths } : {}) },
    });
    setNote('');
    setCount('1');
  };

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor={`${trayId}-kind`} className={fieldLabel}>
            Log type
          </label>
          <select id={`${trayId}-kind`} className={fieldInput} value={kind} onChange={(e) => setKind(e.target.value as TrayLogKind)}>
            <option value="watering">Watering</option>
            <option value="pest">Pest</option>
            <option value="death">Death</option>
          </select>
        </div>
        {kind === 'death' && (
          <div>
            <label htmlFor={`${trayId}-count`} className={fieldLabel}>
              Number of seedlings
            </label>
            <input
              id={`${trayId}-count`}
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              className={fieldInput}
              value={count}
              onChange={(e) => setCount(e.target.value)}
            />
          </div>
        )}
      </div>
      <div>
        <label htmlFor={`${trayId}-note`} className={fieldLabel}>
          Note
        </label>
        <input
          id={`${trayId}-note`}
          className={fieldInput}
          value={note}
          placeholder={kind === 'pest' ? 'What you saw and what you did' : DEFAULT_NOTE[kind]}
          onChange={(e) => setNote(e.target.value)}
          aria-invalid={error ? true : undefined}
        />
      </div>
      {error && <p className={fieldError}>{error}</p>}
      <button type="submit" className={btnSecondary}>
        Add log
      </button>
    </form>
  );
}
