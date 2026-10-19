import type { ReactNode } from 'react';

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-soil-200 px-5 py-8 text-center">
      <p className="font-display text-lg text-soil-900">{title}</p>
      {body && <p className="mx-auto mt-1 max-w-prose text-sm text-soil-700">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
