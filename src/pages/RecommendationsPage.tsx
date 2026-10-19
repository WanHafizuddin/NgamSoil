import { PageHeader } from '../components/PageHeader';
import { PreliminaryBadge } from '../components/PreliminaryBadge';
import { SampleBadge } from '../components/SampleBadge';
import { useData } from '../state/DataContext';
import { SPECIES } from '../data/species';
import { recommendForSpecies } from '../lib/scoring';
import { mixLabel } from '../lib/format';

export function RecommendationsPage() {
  const { data } = useData();

  return (
    <>
      <PageHeader
        title="Recommendations"
        intro={
          <>
            <p>Rule-based score: height growth 50%, leaf health 30%, survival 20%.</p>
            <p>Updates as more batches and trials are added.</p>
            <p className="mt-1 text-sm">All recommendations are preliminary until the 3-month Elmina nursery pilot ends.</p>
          </>
        }
      />
      <div className="grid gap-4 md:grid-cols-2">
        {SPECIES.map((sp) => {
          const rec = recommendForSpecies(data.trials, sp.id);
          const headingId = `rec-${sp.id}`;
          return (
            <article key={sp.id} aria-labelledby={headingId} className="flex flex-col gap-3 rounded-2xl border border-soil-200 bg-white p-4 md:p-5">
              <header>
                <h2 id={headingId} className="text-2xl font-semibold text-leaf-900">
                  {sp.common}
                </h2>
                <p className="text-sm italic text-soil-700">{sp.scientific}</p>
              </header>

              {rec ? (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display text-xl font-semibold text-soil-900">Best mix: {mixLabel(rec.best.mixPct)}</p>
                    <PreliminaryBadge />
                    <SampleBadge />
                  </div>
                  <p className="text-sm font-bold text-soil-700">{`${rec.trayCount} trays · ${rec.weekCount} weeks`}</p>
                  <p className="text-soil-900">{rec.reason}</p>
                  <ol aria-label={`${sp.common} mix ranking`} className="flex flex-col gap-2">
                    {rec.ranking.map((m, i) => (
                      <li key={m.mixPct}>
                        <div className="flex justify-between text-sm">
                          <span className={i === 0 ? 'font-bold text-leaf-900' : 'text-soil-700'}>{mixLabel(m.mixPct)}</span>
                          <span className="tabular-nums text-soil-900">{m.score.toFixed(1)}</span>
                        </div>
                        <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-soil-100">
                          <div className={`h-full rounded-full ${i === 0 ? 'bg-leaf-700' : 'bg-soil-500'}`} style={{ width: `${m.score}%` }} />
                        </div>
                      </li>
                    ))}
                  </ol>
                </>
              ) : (
                <p className="text-soil-700">No trial data yet</p>
              )}
            </article>
          );
        })}
      </div>
    </>
  );
}
