import { useParams } from 'react-router-dom';
import { Leaf, Sprout, Thermometer } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Strata } from '../components/Strata';
import { SampleBadge } from '../components/SampleBadge';
import { RolePicker } from '../components/RolePicker';
import { useData } from '../state/DataContext';
import { getSpecies } from '../data/species';
import { formatDate, formatKg, mixLabel } from '../lib/format';

const STEPS = [
  { icon: Leaf, title: 'Leaves collected', body: 'Fallen leaves, branches and grass from township parks and homes.' },
  { icon: Thermometer, title: 'Composted and tested', body: 'Sensors watched the pile heat up, and a seed test checked it was mature.' },
  {
    icon: Sprout,
    title: 'Grown into this tree',
    body: 'The nursery is trialling compost mixes for this species. Results stay preliminary until the pilot ends.',
  },
];

export function PublicTreePage() {
  const { id } = useParams();
  const { data } = useData();
  const tree = data.trees.find((t) => t.id === id);

  const footer = (
    <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-soil-200 px-4 py-6 text-sm text-soil-700">
      <span>A NgamSoil pilot at the Elmina nursery</span>
      <RolePicker tone="light" />
    </footer>
  );

  if (!tree) {
    return (
      <div className="min-h-screen">
        <header className="bg-leaf-900 px-4 py-4 text-soil-50">
          <Logo />
        </header>
        <Strata />
        <main className="mx-auto max-w-xl px-4 py-12 text-center">
          <h1 className="text-3xl font-semibold text-leaf-900">Tree not found</h1>
          <p className="mt-3 text-soil-700">Check the tag and try again.</p>
          <p className="mt-2 text-sm text-soil-700">Tags added in this demo only open on the device that created them.</p>
        </main>
        {footer}
      </div>
    );
  }

  const species = getSpecies(tree.species);
  const tray = data.trials.flatMap((t) => t.trays).find((t) => t.id === tree.trayId);
  const totalKg = data.intakes.reduce((s, i) => s + i.weightKg, 0);

  return (
    <div className="min-h-screen">
      <header className="bg-leaf-900 text-soil-50">
        <div className="mx-auto max-w-xl px-4 pb-10 pt-4">
          <Logo />
          <p className="mt-10 text-sm text-leaf-100">Tree {tree.id}</p>
          <h1 className="font-display text-6xl font-semibold tracking-tight">{species.common}</h1>
          <p className="mt-1 text-lg italic text-leaf-100">{species.scientific}</p>
          <p className="mt-6 max-w-sm font-display text-2xl leading-snug">
            {tray?.mixPct === 0
              ? "A control tree in a trial of compost from your township's leaves"
              : "Grown with compost from your township's leaves"}
          </p>
        </div>
        <Strata />
      </header>

      <main className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-8">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-5">
          <div>
            <dt className="text-sm text-soil-700">Planted</dt>
            <dd className="font-bold text-soil-900">{tree.plantedAt ? formatDate(tree.plantedAt) : 'Still growing in the Elmina nursery'}</dd>
          </div>
          <div>
            <dt className="text-sm text-soil-700">Location</dt>
            <dd className="font-bold text-soil-900">{tree.location ?? (tree.plantedAt ? 'Not recorded' : 'Elmina nursery')}</dd>
          </div>
          <div>
            <dt className="text-sm text-soil-700">Compost batch</dt>
            <dd className="font-bold text-soil-900">{tree.batchId}</dd>
          </div>
          <div>
            <dt className="text-sm text-soil-700">Compost mix</dt>
            <dd className="font-bold text-soil-900">{tray ? mixLabel(tray.mixPct) : 'Unknown'}</dd>
          </div>
        </dl>

        <section aria-label="Township total" className="rounded-2xl bg-soil-100 p-5">
          <div className="flex items-start justify-between gap-3">
            <p className="text-soil-700">Your township has diverted</p>
            <SampleBadge />
          </div>
          <p className="font-display text-5xl font-semibold text-leaf-900">{formatKg(totalKg)}</p>
          <p className="text-soil-700">of garden waste, collected from parks and homes so far.</p>
        </section>

        <section aria-labelledby="journey">
          <h2 id="journey" className="mb-3 text-2xl font-semibold text-leaf-900">
            How this tree got here
          </h2>
          <ol className="flex flex-col gap-4">
            {STEPS.map(({ icon: Icon, title, body }, i) => (
              <li key={title} className="flex gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-leaf-100 text-leaf-900">
                  <Icon aria-hidden className="h-5 w-5" />
                  <span className="sr-only">Step {i + 1}</span>
                </span>
                <span>
                  <span className="block font-bold text-soil-900">{title}</span>
                  <span className="block text-sm text-soil-700">{body}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      </main>
      {footer}
    </div>
  );
}
