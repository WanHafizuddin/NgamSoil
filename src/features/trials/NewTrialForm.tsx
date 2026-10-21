import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SpeciesId } from '../../types';
import { SPECIES } from '../../data/species';
import { useData } from '../../state/DataContext';
import { nextTrialId } from '../../lib/ids';
import { nowIso } from '../../lib/dates';
import { formatGI } from '../../lib/format';
import { btnPrimary, fieldInput, fieldLabel } from '../../components/ui';

export function NewTrialForm({ preselectBatch }: { preselectBatch?: string }) {
  const { data, dispatch } = useData();
  const navigate = useNavigate();
  const eligible = data.batches.filter((b) => b.status === 'passed' || b.status === 'sent_to_nursery');
  const [species, setSpecies] = useState<SpeciesId>('meranti');
  const [batchId, setBatchId] = useState(
    eligible.some((b) => b.id === preselectBatch) ? preselectBatch! : (eligible[0]?.id ?? ''),
  );

  if (eligible.length === 0) {
    return <p className="text-soil-700">No passed batches yet. Run a maturity test first.</p>;
  }

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const id = nextTrialId(data.trials);
    dispatch({ type: 'createTrial', id, species, batchId, now: nowIso() });
    navigate(`/trials/${id}`);
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="trial-species" className={fieldLabel}>
          Species
        </label>
        <select id="trial-species" className={fieldInput} value={species} onChange={(e) => setSpecies(e.target.value as SpeciesId)}>
          {SPECIES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.common}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="trial-batch" className={fieldLabel}>
          Compost batch
        </label>
        <select id="trial-batch" className={fieldInput} value={batchId} onChange={(e) => setBatchId(e.target.value)}>
          {eligible.map((b) => (
            <option key={b.id} value={b.id}>
              {`${b.id} · GI ${formatGI(b.testResult?.gi ?? null)}`}
            </option>
          ))}
        </select>
      </div>
      <p className="text-sm text-soil-700">Four trays are set up: 0% compost as the control, then 25%, 50% and 75% compost.</p>
      <button type="submit" className={btnPrimary}>
        Start trial
      </button>
    </form>
  );
}
