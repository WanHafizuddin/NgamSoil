import { useState, type FormEvent } from 'react';
import { useData } from '../../state/DataContext';
import { getSpecies } from '../../data/species';
import { nextTreeId } from '../../lib/ids';
import { mixLabel } from '../../lib/format';
import { todayLocal } from '../../lib/dates';
import { btnPrimary, fieldInput, fieldLabel } from '../../components/ui';

export function NewTreeForm() {
  const { data, dispatch } = useData();
  const options = data.trials.flatMap((trial) =>
    trial.trays.map((tray) => ({
      trial,
      tray,
      label: `${getSpecies(trial.species).common} · ${mixLabel(tray.mixPct)} · ${trial.id}`,
    })),
  );
  const [trayId, setTrayId] = useState(options[0]?.tray.id ?? '');
  const [plantedAt, setPlantedAt] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState('');

  if (options.length === 0) {
    return <p className="text-soil-700">Start a nursery trial first to tag its seedlings.</p>;
  }

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const chosen = options.find((o) => o.tray.id === trayId) ?? options[0];
    const id = nextTreeId(data.trees);
    dispatch({
      type: 'createTree',
      tree: {
        id,
        species: chosen.trial.species,
        trayId: chosen.tray.id,
        batchId: chosen.trial.batchId,
        ...(plantedAt ? { plantedAt } : {}),
        ...(location.trim() ? { location: location.trim() } : {}),
      },
    });
    setStatus(`Tree ${id} tagged`);
    setPlantedAt('');
    setLocation('');
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="tree-tray" className={fieldLabel}>
          Seedling tray
        </label>
        <select id="tree-tray" className={fieldInput} value={trayId} onChange={(e) => setTrayId(e.target.value)}>
          {options.map((o) => (
            <option key={o.tray.id} value={o.tray.id}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="tree-planted" className={fieldLabel}>
            Planting date (optional)
          </label>
          <input id="tree-planted" type="date" max={todayLocal()} className={fieldInput} value={plantedAt} onChange={(e) => setPlantedAt(e.target.value)} />
        </div>
        <div>
          <label htmlFor="tree-location" className={fieldLabel}>
            Location (optional)
          </label>
          <input id="tree-location" className={fieldInput} value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
      </div>
      <button type="submit" className={btnPrimary}>
        Add tree
      </button>
      <p role="status" aria-live="polite" className="min-h-6 font-bold text-leaf-700">
        {status}
      </p>
    </form>
  );
}
