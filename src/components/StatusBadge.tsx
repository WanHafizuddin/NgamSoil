import type { BatchStatus } from '../types';
import { STATUS_LABEL } from '../lib/format';

const STYLES: Record<BatchStatus, string> = {
  composting: 'bg-sun-100 text-soil-900 ring-sun-400/70',
  ready_for_test: 'bg-water-100 text-water-700 ring-water-500/40',
  passed: 'bg-leaf-100 text-leaf-900 ring-leaf-500/50',
  failed: 'bg-ember-100 text-ember-700 ring-ember-500/40',
  sent_to_nursery: 'bg-leaf-700 text-white ring-leaf-700',
};

export function StatusBadge({ status }: { status: BatchStatus }) {
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ${STYLES[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}
