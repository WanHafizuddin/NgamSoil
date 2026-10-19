import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState } from '../components/EmptyState';
import { SampleBadge } from '../components/SampleBadge';
import { btnPrimary } from '../components/ui';
import { useData } from '../state/DataContext';
import { formatDate, formatGI, formatKg } from '../lib/format';

export function BatchesPage() {
  const { data } = useData();
  const batches = [...data.batches].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const weightOf = (ids: string[]) => data.intakes.filter((i) => ids.includes(i.id)).reduce((s, i) => s + i.weightKg, 0);

  return (
    <>
      <PageHeader title="Compost batches" intro="Each batch is one pile, from the first load of leaves to the nursery." />
      {batches.length === 0 ? (
        <EmptyState
          title="No batches yet"
          body="Group intakes into a batch on the Intake screen."
          action={
            <Link to="/intake" className={btnPrimary}>
              Log an intake
            </Link>
          }
        />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {batches.map((b) => (
            <li key={b.id}>
              <Link
                to={`/batches/${b.id}`}
                className="flex h-full flex-col gap-2 rounded-2xl border border-soil-200 bg-white p-4 hover:border-leaf-500"
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="font-display text-xl font-semibold text-leaf-900">{b.id}</span>
                  <StatusBadge status={b.status} />
                </span>
                <span className="text-sm text-soil-700">
                  Started {formatDate(b.createdAt)}, {formatKg(weightOf(b.intakeIds))} from {b.intakeIds.length} loads
                </span>
                {b.testResult && (
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-soil-900">GI {formatGI(b.testResult.gi)}</span>
                    <SampleBadge />
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
