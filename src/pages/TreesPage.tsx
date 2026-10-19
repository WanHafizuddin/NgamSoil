import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Printer } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Panel } from '../components/Panel';
import { EmptyState } from '../components/EmptyState';
import { btnSecondary, textLink } from '../components/ui';
import { NewTreeForm } from '../features/trees/NewTreeForm';
import { useData } from '../state/DataContext';
import { getSpecies } from '../data/species';
import { treeUrl } from '../lib/treeUrl';
import { formatDate } from '../lib/format';

export function TreesPage() {
  const { data } = useData();

  return (
    <>
      <PageHeader title="Tree QR tags" intro="Each tag links a tree to the compost batch it grew in. Residents scan it to see the story.">
        {data.trees.length > 0 && (
          <button type="button" className={`${btnSecondary} print:hidden`} onClick={() => window.print()}>
            <Printer aria-hidden className="h-5 w-5" />
            Print tags
          </button>
        )}
      </PageHeader>

      <p className="-mt-3 mb-5 max-w-2xl text-sm text-soil-700 print:hidden">
        New tags are saved in this browser only, so they open on this device. Sample tags RL-T-0001 to RL-T-0006 open on any device.
      </p>

      {data.trees.length === 0 ? (
        <EmptyState title="No trees tagged yet" body="Tag a seedling from a trial tray below." />
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 print:grid-cols-3">
          {data.trees.map((t) => {
            const url = treeUrl(t.id);
            return (
              <li key={t.id} className="flex gap-4 rounded-2xl border border-soil-200 bg-white p-4 print:break-inside-avoid">
                <QRCodeSVG value={url} title={url} size={112} level="M" marginSize={2} fgColor="#1F3B2C" className="shrink-0 rounded-lg" />
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="font-display text-lg font-semibold text-leaf-900">{getSpecies(t.species).common}</span>
                  <span className="text-sm font-bold text-soil-900">{t.id}</span>
                  <span className="text-sm text-soil-700">
                    {t.plantedAt ? `Planted ${formatDate(t.plantedAt)}${t.location ? `, ${t.location}` : ''}` : 'In nursery'}
                  </span>
                  <Link to={`/tree/${t.id}`} className={`${textLink} mt-auto text-sm print:hidden`}>
                    Open public page
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Panel title="Tag a tree" className="mt-6 print:hidden">
        <NewTreeForm />
      </Panel>
    </>
  );
}
