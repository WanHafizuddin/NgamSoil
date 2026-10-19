import { useState, type FormEvent } from 'react';
import { INTAKE_SOURCES, MATERIALS, type IntakeSource, type Material } from '../../types';
import { useData } from '../../state/DataContext';
import { nextIntakeId } from '../../lib/ids';
import { todayLocal } from '../../lib/dates';
import { MATERIAL_LABEL } from '../../lib/format';
import { btnPrimary, fieldError, fieldInput, fieldLabel } from '../../components/ui';

type Errors = Partial<Record<'weight' | 'collector' | 'date', string>>;

export function IntakeForm() {
  const { data, dispatch } = useData();
  const today = todayLocal();
  const [source, setSource] = useState<IntakeSource>(INTAKE_SOURCES[0]);
  const [material, setMaterial] = useState<Material>('leaves');
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(today);
  const [collector, setCollector] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const weightKg = Number(weight);
    const next: Errors = {};
    if (!(weightKg > 0)) next.weight = 'Weight must be more than 0 kg';
    if (!collector.trim()) next.collector = "Enter the collector's name";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) next.date = 'Enter the collection date';
    else if (date > today) next.date = "Date can't be in the future";
    setErrors(next);
    if (Object.keys(next).length > 0) {
      setStatus('');
      return;
    }

    const id = nextIntakeId(data.intakes);
    dispatch({ type: 'addIntake', intake: { id, date, source, material, weightKg, collector: collector.trim() } });
    setStatus(`Intake ${id} logged`);
    setWeight('');
    setCollector('');
  };

  const errorProps = (field: keyof Errors) =>
    errors[field] ? { 'aria-invalid': true, 'aria-describedby': `intake-${field}-error` } : {};

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="intake-source" className={fieldLabel}>
          Source
        </label>
        <select id="intake-source" className={fieldInput} value={source} onChange={(e) => setSource(e.target.value as IntakeSource)}>
          {INTAKE_SOURCES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      <fieldset>
        <legend className={fieldLabel}>Material</legend>
        <div className="mt-1 grid grid-cols-3 gap-2">
          {MATERIALS.map((m) => (
            <label
              key={m}
              className={`flex min-h-11 cursor-pointer items-center justify-center rounded-xl border-2 font-bold has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-leaf-500 ${
                material === m ? 'border-leaf-700 bg-leaf-100 text-leaf-900' : 'border-soil-200 bg-white text-soil-700'
              }`}
            >
              <input type="radio" name="material" value={m} checked={material === m} onChange={() => setMaterial(m)} className="sr-only" />
              {MATERIAL_LABEL[m]}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="intake-weight" className={fieldLabel}>
            Weight (kg)
          </label>
          <input
            id="intake-weight"
            type="number"
            inputMode="decimal"
            min="0.1"
            step="0.1"
            className={fieldInput}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            {...errorProps('weight')}
          />
          {errors.weight && (
            <p id="intake-weight-error" className={fieldError}>
              {errors.weight}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="intake-date" className={fieldLabel}>
            Date
          </label>
          <input
            id="intake-date"
            type="date"
            max={today}
            className={fieldInput}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            {...errorProps('date')}
          />
          {errors.date && (
            <p id="intake-date-error" className={fieldError}>
              {errors.date}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="intake-collector" className={fieldLabel}>
          Collector
        </label>
        <input
          id="intake-collector"
          autoComplete="off"
          className={fieldInput}
          value={collector}
          onChange={(e) => setCollector(e.target.value)}
          {...errorProps('collector')}
        />
        {errors.collector && (
          <p id="intake-collector-error" className={fieldError}>
            {errors.collector}
          </p>
        )}
      </div>

      <button type="submit" className={btnPrimary}>
        Log intake
      </button>
      <p role="status" aria-live="polite" className="min-h-6 font-bold text-leaf-700">
        {status}
      </p>
    </form>
  );
}
