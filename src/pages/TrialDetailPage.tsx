import { useState, type KeyboardEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Panel } from '../components/Panel';
import { GrowthChart } from '../components/charts/GrowthChart';
import { textLink } from '../components/ui';
import { TrayPanel } from '../features/trials/TrayPanel';
import { useData } from '../state/DataContext';
import { getSpecies } from '../data/species';
import { formatDate, mixLabel } from '../lib/format';

export function TrialDetailPage() {
  const { id } = useParams();
  const { data } = useData();
  const trial = data.trials.find((t) => t.id === id);
  const [selected, setSelected] = useState(0);

  if (!trial) {
    return <PageHeader title="Trial not found" intro={<Link to="/trials" className={textLink}>See all trials</Link>} />;
  }

  const sp = getSpecies(trial.species);
  const tray = trial.trays[selected] ?? trial.trays[0];
  const onTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const next = (selected + (e.key === 'ArrowRight' ? 1 : trial.trays.length - 1)) % trial.trays.length;
    setSelected(next);
    document.getElementById(`tab-${trial.trays[next].id}`)?.focus();
  };

  return (
    <>
      <PageHeader
        title={`${sp.common} trial`}
        intro={
          <>
            <span className="italic">{sp.scientific}</span>. Compost from{' '}
            <Link to={`/batches/${trial.batchId}`} className={textLink}>
              {trial.batchId}
            </Link>
            , started {formatDate(trial.startDate)}.
          </>
        }
      />

      <Panel title="Growth by mix" sample className="mb-6">
        <GrowthChart trays={trial.trays} />
      </Panel>

      <div role="tablist" aria-label="Trays" className="mb-4 grid auto-cols-fr grid-flow-col gap-1 rounded-full bg-soil-100 p-1" onKeyDown={onTabKey}>
        {trial.trays.map((t, i) => (
          <button
            key={t.id}
            id={`tab-${t.id}`}
            type="button"
            role="tab"
            aria-selected={i === selected}
            aria-controls={`panel-${t.id}`}
            tabIndex={i === selected ? 0 : -1}
            onClick={() => setSelected(i)}
            className={`min-h-11 rounded-full px-2 text-sm font-bold ${i === selected ? 'bg-leaf-700 text-white' : 'text-soil-700 hover:bg-soil-200'}`}
          >
            {mixLabel(t.mixPct)}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`panel-${tray.id}`} aria-labelledby={`tab-${tray.id}`}>
        <TrayPanel key={tray.id} trialId={trial.id} species={trial.species} tray={tray} />
      </div>
    </>
  );
}
