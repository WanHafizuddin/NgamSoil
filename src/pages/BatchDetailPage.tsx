import { Link, useParams } from 'react-router-dom';
import { TriangleAlert } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Panel } from '../components/Panel';
import { StatusBadge } from '../components/StatusBadge';
import { BatchFlow } from '../components/BatchFlow';
import { TempChart } from '../components/charts/TempChart';
import { btnPrimary, textLink } from '../components/ui';
import { useData } from '../state/DataContext';
import { detectAlerts } from '../lib/alerts';
import { formatDate, formatDateTime, formatGI, formatKg, MATERIAL_LABEL } from '../lib/format';

export function BatchDetailPage() {
  const { id } = useParams();
  const { data, dispatch } = useData();
  const batch = data.batches.find((b) => b.id === id);

  if (!batch) {
    return (
      <PageHeader title="Batch not found" intro={<Link to="/batches" className={textLink}>See all batches</Link>} />
    );
  }

  const intakes = data.intakes.filter((i) => batch.intakeIds.includes(i.id));
  const totalKg = intakes.reduce((s, i) => s + i.weightKg, 0);
  const alerts = detectAlerts(batch);
  const result = batch.testResult;

  return (
    <>
      <PageHeader title={batch.id} intro={`Started ${formatDate(batch.createdAt)}`}>
        <StatusBadge status={batch.status} />
      </PageHeader>

      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-soil-200 bg-white p-4 md:flex-row md:items-center md:justify-between">
        <div className="md:w-1/2">
          <BatchFlow status={batch.status} />
        </div>
        {batch.status === 'composting' && (
          <button type="button" className={btnPrimary} onClick={() => dispatch({ type: 'markReadyForTest', batchId: batch.id })}>
            Mark ready for test
          </button>
        )}
        {batch.status === 'ready_for_test' && (
          <Link to={`/batches/${batch.id}/test`} className={btnPrimary}>
            Run maturity test
          </Link>
        )}
        {(batch.status === 'passed' || batch.status === 'sent_to_nursery') && (
          <Link to={`/trials?batch=${batch.id}`} className={btnPrimary}>
            Start a nursery trial
          </Link>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Panel title="Temperature" sample caption="IoT probe in the pile core, one reading every 30 min.">
          <TempChart readings={batch.tempReadings} />
        </Panel>

        <div className="flex flex-col gap-4">
          <Panel title="Alerts" sample>
            {alerts.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {alerts.map((a) => (
                  <li key={a.id} className="flex gap-3 rounded-xl bg-ember-100/60 p-3">
                    <TriangleAlert aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-ember-700" />
                    <span>
                      <span className="block font-bold">{a.message}</span>
                      <span className="block text-sm text-soil-700">{formatDateTime(a.at)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-soil-700">No alerts for this batch</p>
            )}
          </Panel>

          {result && (
            <Panel title="Maturity test" sample>
              <p className="flex flex-wrap items-baseline gap-3">
                <span className="font-display text-3xl font-semibold text-leaf-900">GI {formatGI(result.gi)}</span>
                <span className={`rounded-full px-2.5 py-0.5 text-sm font-bold ${result.passed ? 'bg-leaf-100 text-leaf-900' : 'bg-ember-100 text-ember-700'}`}>
                  {result.passed ? 'Pass' : 'Fail'}
                </span>
              </p>
              <p className="mt-1 text-sm text-soil-700">Tested {formatDate(result.date)}. A pass needs a Germination Index above 80%.</p>
            </Panel>
          )}
        </div>
      </div>

      <Panel title="Inputs" className="mt-4">
        <p className="mb-3 flex items-baseline gap-2">
          <span className="text-soil-700">Total input</span>
          <span className="font-display text-2xl font-semibold text-leaf-900">{formatKg(totalKg)}</span>
        </p>
        <ul aria-label="Linked intakes" className="divide-y divide-soil-100">
          {intakes.map((i) => (
            <li key={i.id} className="flex flex-wrap justify-between gap-x-3 py-2 text-sm">
              <span>
                <span className="font-bold">{MATERIAL_LABEL[i.material]}</span>, {i.source}
              </span>
              <span className="text-soil-700">
                {formatDate(i.date)}, {formatKg(i.weightKg)}
              </span>
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}
