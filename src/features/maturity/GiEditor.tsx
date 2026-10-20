import { useEffect, useId, useRef, useState } from 'react';
import type { GerminationInput } from '../../types';
import { computeGI, isPass } from '../../lib/gi';
import { formatGI } from '../../lib/format';
import { SEEDS_PER_DISH } from '../../sim/ai';
import { fieldError } from '../../components/ui';

export type GiResult = { input: GerminationInput; gi: number } | null;

const parse = (raw: string) => (raw.trim() === '' ? NaN : Number(raw));
const isValidLength = (n: number) => Number.isFinite(n) && n >= 0;
const mean = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;

function LengthList({
  title,
  prefix,
  values,
  onEdit,
  errorId,
  noteId,
}: {
  title: string;
  prefix: string;
  values: string[];
  onEdit: (index: number, value: string) => void;
  /** Describes each invalid cell. */
  errorId: string;
  /** Describes every cell in the list. */
  noteId?: string;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 font-bold text-soil-900">{title}</legend>
      <ol className="grid grid-cols-2 gap-2">
        {values.map((v, i) => {
          const invalid = !isValidLength(parse(v));
          const id = `${prefix}-${i}`;
          const describedBy = [invalid && errorId, noteId].filter(Boolean).join(' ') || undefined;
          return (
            <li key={i}>
              <label htmlFor={id} className="sr-only">
                {`${prefix === 'sample' ? 'Sample' : 'Control'} seed ${i + 1} root length (mm)`}
              </label>
              <div className="flex items-center gap-2">
                <span aria-hidden className="w-5 text-right text-xs text-soil-500">
                  {i + 1}
                </span>
                <input
                  id={id}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.1"
                  value={v}
                  onChange={(e) => onEdit(i, e.target.value)}
                  aria-invalid={invalid || undefined}
                  aria-describedby={describedBy}
                  className="min-h-11 w-full min-w-0 rounded-lg border border-soil-200 bg-white px-2 text-right tabular-nums aria-[invalid=true]:border-ember-500 aria-[invalid=true]:ring-1 aria-[invalid=true]:ring-ember-500"
                />
              </div>
            </li>
          );
        })}
      </ol>
    </fieldset>
  );
}

export function GiEditor({ initial, onChange }: { initial: GerminationInput; onChange: (result: GiResult) => void }) {
  const [sample, setSample] = useState(() => initial.rootLengthsSample.map(String));
  const [control, setControl] = useState(() => initial.rootLengthsControl.map(String));
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const sampleNums = sample.map(parse);
  const controlNums = control.map(parse);
  const allValid = [...sampleNums, ...controlNums].every(isValidLength);
  const input: GerminationInput = { ...initial, rootLengthsSample: sampleNums, rootLengthsControl: controlNums };
  const gi = allValid ? computeGI(input) : null;
  const controlZero = allValid && mean(controlNums) <= 0;
  const errorId = useId();
  const controlNoteId = useId();
  const resultKey = JSON.stringify(gi === null ? null : input);

  useEffect(() => {
    onChangeRef.current(gi === null ? null : { input, gi });
    // resultKey captures every value the result depends on.
  }, [resultKey]);

  const edit = (setter: typeof setSample) => (index: number, value: string) =>
    setter((prev) => prev.map((v, i) => (i === index ? value : v)));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 rounded-2xl bg-leaf-900 p-4 text-soil-50 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-bold text-leaf-100">Germination Index</p>
          <p className="flex items-baseline gap-3">
            <span className="font-display text-5xl font-semibold">{formatGI(gi)}</span>
            {gi !== null && (
              <span className={`rounded-full px-3 py-0.5 text-sm font-bold ${isPass(gi) ? 'bg-leaf-100 text-leaf-900' : 'bg-ember-100 text-ember-700'}`}>
                {isPass(gi) ? 'Pass' : 'Fail'}
              </span>
            )}
          </p>
        </div>
        <div className="text-sm text-leaf-100">
          <p>{`Germinated: ${initial.seedsSample}/${SEEDS_PER_DISH} sample, ${initial.seedsControl}/${SEEDS_PER_DISH} control`}</p>
          <p>
            {allValid
              ? `Mean root length: ${mean(sampleNums).toFixed(1)} mm sample vs ${mean(controlNums).toFixed(1)} mm control`
              : 'Mean root length: —'}
          </p>
        </div>
      </div>

      <p className="text-sm text-soil-700">
        GI = (germination % of sample ÷ control) × (mean root length of sample ÷ control) × 100. A pass needs more than 80%. Correct any root
        length the photo analysis misread.
      </p>
      {!allValid && (
        <p id={errorId} className={fieldError}>
          Enter a length of 0 mm or more
        </p>
      )}
      {controlZero && (
        <p id={controlNoteId} className={fieldError}>
          Control roots must be longer than 0 mm
        </p>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <LengthList title="Sample root lengths (mm)" prefix="sample" values={sample} onEdit={edit(setSample)} errorId={errorId} />
        <LengthList
          title="Control root lengths (mm)"
          prefix="control"
          values={control}
          onEdit={edit(setControl)}
          errorId={errorId}
          noteId={controlZero ? controlNoteId : undefined}
        />
      </div>
    </div>
  );
}
