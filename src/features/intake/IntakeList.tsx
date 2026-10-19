import { Link } from 'react-router-dom';
import type { Intake } from '../../types';
import { formatDate, formatKg, MATERIAL_LABEL } from '../../lib/format';

export function IntakeList({
  intakes,
  selected,
  onToggle,
}: {
  intakes: Intake[];
  selected: Set<string>;
  onToggle: (id: string) => void;
}) {
  const sorted = [...intakes].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));

  return (
    <ul aria-label="Intake log" className="divide-y divide-soil-100">
      {sorted.map((i) => (
        <li key={i.id} className="flex items-center gap-3 py-3">
          {i.batchId ? (
            <span className="flex h-11 w-11 shrink-0 items-center justify-center">
              <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-leaf-500" />
            </span>
          ) : (
            <label className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-lg hover:bg-leaf-100">
              <input
                type="checkbox"
                aria-label={`Select ${i.id}`}
                checked={selected.has(i.id)}
                onChange={() => onToggle(i.id)}
                className="h-6 w-6 cursor-pointer accent-leaf-700"
              />
            </label>
          )}
          <div className="min-w-0 flex-1">
            <p className="flex flex-wrap items-baseline justify-between gap-x-3">
              <span className="font-bold text-soil-900">
                {MATERIAL_LABEL[i.material]}, {formatKg(i.weightKg)}
              </span>
              <span className="text-sm text-soil-700">{formatDate(i.date)}</span>
            </p>
            <p className="text-sm text-soil-700">
              {i.source}, collected by {i.collector}
            </p>
            <p className="text-sm">
              {i.batchId ? (
                <Link to={`/batches/${i.batchId}`} className="font-bold text-leaf-700 underline underline-offset-2">
                  In {i.batchId}
                </Link>
              ) : (
                <span className="text-soil-500">{i.id}, not in a batch yet</span>
              )}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
