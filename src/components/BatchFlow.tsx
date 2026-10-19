import type { BatchStatus } from '../types';

const STEP_OF: Record<BatchStatus, number> = {
  composting: 0,
  ready_for_test: 1,
  passed: 2,
  failed: 2,
  sent_to_nursery: 3,
};

function labels(status: BatchStatus): string[] {
  const verdict = status === 'failed' ? 'Failed' : status === 'passed' || status === 'sent_to_nursery' ? 'Passed' : 'Passed or failed';
  return ['Composting', 'Ready for test', verdict, 'Sent to nursery'];
}

export function BatchFlow({ status }: { status: BatchStatus }) {
  const current = STEP_OF[status];
  const failed = status === 'failed';

  return (
    <ol aria-label="Batch progress" className="grid grid-cols-4 gap-1">
      {labels(status).map((label, i) => {
        const done = i < current;
        const isCurrent = i === current;
        const bar = isCurrent && failed ? 'bg-ember-500' : done || isCurrent ? 'bg-leaf-500' : 'bg-soil-200';
        return (
          <li key={i} aria-current={isCurrent ? 'step' : undefined} className="flex flex-col gap-1.5">
            <span className={`h-1.5 rounded-full ${bar}`} />
            <span className={`text-xs leading-tight ${isCurrent ? 'font-bold text-soil-900' : 'text-soil-700'}`}>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}
