import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Panel } from '../components/Panel';
import { EmptyState } from '../components/EmptyState';
import { btnPrimary } from '../components/ui';
import { IntakeForm } from '../features/intake/IntakeForm';
import { IntakeList } from '../features/intake/IntakeList';
import { useData } from '../state/DataContext';
import { nextBatchId } from '../lib/ids';
import { nowIso, todayLocal } from '../lib/dates';

export function IntakePage() {
  const { data, dispatch } = useData();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const createBatch = () => {
    const id = nextBatchId(data.batches, Number(todayLocal().slice(0, 4)));
    dispatch({ type: 'createBatch', id, intakeIds: [...selected], now: nowIso() });
    navigate(`/batches/${id}`);
  };

  return (
    <>
      <PageHeader title="Waste intake" intro="Log each load of leaves, branches or grass, then group loads into a compost pile." />
      <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:items-start">
        <Panel title="New intake">
          <IntakeForm />
        </Panel>

        <Panel
          title="Intake log"
          caption="Tick loads that are not in a batch yet to start a new compost pile."
          actions={
            <button type="button" className={btnPrimary} disabled={selected.size === 0} onClick={createBatch}>
              Create batch from {selected.size} selected
            </button>
          }
        >
          {data.intakes.length > 0 ? (
            <IntakeList intakes={data.intakes} selected={selected} onToggle={toggle} />
          ) : (
            <EmptyState title="No intakes yet" body="Logged loads appear here." />
          )}
        </Panel>
      </div>
    </>
  );
}
