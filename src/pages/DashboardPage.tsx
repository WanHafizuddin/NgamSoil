import { useId } from 'react';
import { Link } from 'react-router-dom';
import { Recycle, Scale, Sprout, TriangleAlert, Thermometer, HeartPulse } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Panel } from '../components/Panel';
import { KpiCard } from '../components/KpiCard';
import { EmptyState } from '../components/EmptyState';
import { WasteChart } from '../components/charts/WasteChart';
import { SampleBadge } from '../components/SampleBadge';
import { btnDanger, btnSecondary } from '../components/ui';
import { useData } from '../state/DataContext';
import { computeKpis, wasteByWeek } from '../lib/kpis';
import { activeAlerts } from '../lib/alerts';
import { formatDateTime, formatKg, formatPct } from '../lib/format';

export function DashboardPage() {
  const { data, dispatch } = useData();
  const kpis = computeKpis(data);
  const weeks = wasteByWeek(data.intakes, 8);
  const alerts = activeAlerts(data.batches);
  const alertsHeading = useId();

  return (
    <>
      <PageHeader title="Dashboard" intro="Garden waste from the township, followed from collection to compost to nursery trees." />

      <section aria-label="Key figures" className="mb-6">
        <div className="mb-2 flex justify-end">
          <SampleBadge />
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <KpiCard featured icon={Recycle} label="Waste diverted" value={formatKg(kpis.wasteDivertedKg)} caption="Leaves, branches and grass kept out of landfill" />
          <KpiCard
            compact
            icon={Thermometer}
            label="Batches"
            value={`${kpis.batchesActive} active · ${kpis.batchesPassed} passed · ${kpis.batchesFailed} failed`}
          />
          <KpiCard icon={Sprout} label="Seedlings growing" value={String(kpis.seedlingsGrowing)} />
          <KpiCard icon={HeartPulse} label="Seedling survival" value={formatPct(kpis.survivalRate)} />
          <KpiCard
            icon={Scale}
            label="Est. soil saved"
            value={formatKg(kpis.estimatedSoilSavedKg)}
            caption="Estimate: 40% of input weight from passed batches, used in place of bought soil"
          />
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Panel title="Waste diverted per week" sample>
          {weeks.length > 0 ? <WasteChart weeks={weeks} /> : <EmptyState title="No intakes yet" body="Log a collection on the Intake screen to start the chart." />}
        </Panel>

        <section aria-labelledby={alertsHeading} className="rounded-2xl border border-soil-200 bg-white p-4 md:p-5">
          <div className="mb-3 flex items-center gap-2">
            <h2 id={alertsHeading} className="text-xl font-semibold text-leaf-900">
              Alerts
            </h2>
            <SampleBadge />
          </div>
          {alerts.length > 0 ? (
            <ul aria-labelledby={alertsHeading} className="flex flex-col gap-2">
              {alerts.map((a) => (
                <li key={a.id}>
                  <Link
                    to={`/batches/${a.batchId}`}
                    className="flex gap-3 rounded-xl border border-ember-100 bg-ember-100/50 p-3 hover:border-ember-500"
                  >
                    <TriangleAlert aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-ember-700" />
                    <span>
                      <span className="block font-bold text-soil-900">{a.message}</span>
                      <span className="block text-sm text-soil-700">
                        {a.batchId}, {formatDateTime(a.at)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-soil-700">No alerts. All active piles are within range.</p>
          )}
        </section>
      </div>

      <Panel title="Demo data" className="mt-6" caption="Everything is stored in this browser. Reset to bring back the sample story, or clear to start empty.">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className={btnSecondary}
            onClick={() => window.confirm('Replace all data with the sample data?') && dispatch({ type: 'reset' })}
          >
            Reset to sample data
          </button>
          <button
            type="button"
            className={btnDanger}
            onClick={() => window.confirm('Delete all data? You can reset to the sample data later.') && dispatch({ type: 'clear' })}
          >
            Clear all data
          </button>
        </div>
      </Panel>
    </>
  );
}
