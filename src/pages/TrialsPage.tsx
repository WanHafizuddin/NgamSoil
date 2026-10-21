import { Link, useSearchParams } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Panel } from '../components/Panel';
import { EmptyState } from '../components/EmptyState';
import { NewTrialForm } from '../features/trials/NewTrialForm';
import { useData } from '../state/DataContext';
import { getSpecies } from '../data/species';
import { formatDate } from '../lib/format';

export function TrialsPage() {
  const { data } = useData();
  const [params] = useSearchParams();

  return (
    <>
      <PageHeader title="Nursery trials" intro="Each trial grows one species in four trays, from no compost to three-quarters compost." />
      <div className="grid gap-4 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:items-start">
        <section aria-label="Trials">
          {data.trials.length === 0 ? (
            <EmptyState title="No trials yet" body="Start a trial with a batch that passed its maturity test." />
          ) : (
            <ul className="grid gap-3">
              {data.trials.map((t) => {
                const sp = getSpecies(t.species);
                const weeks = Math.max(0, ...t.trays.flatMap((tr) => tr.weekly.map((w) => w.week)));
                return (
                  <li key={t.id}>
                    <Link to={`/trials/${t.id}`} className="block rounded-2xl border border-soil-200 bg-white p-4 hover:border-leaf-500">
                      <span className="block font-display text-xl font-semibold text-leaf-900">{sp.common}</span>
                      <span className="block text-sm italic text-soil-700">{sp.scientific}</span>
                      <span className="mt-2 block text-sm text-soil-900">
                        {t.id}, compost from {t.batchId}, started {formatDate(t.startDate)}
                      </span>
                      <span className="block text-sm font-bold text-leaf-700">{weeks} weeks of data</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
        <Panel title="New trial">
          <NewTrialForm preselectBatch={params.get('batch') ?? undefined} />
        </Panel>
      </div>
    </>
  );
}
