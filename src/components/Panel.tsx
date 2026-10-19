import { useId, type ReactNode } from 'react';
import { SampleBadge } from './SampleBadge';

export function Panel({
  title,
  sample = false,
  caption,
  actions,
  children,
  className = '',
}: {
  title: string;
  sample?: boolean;
  caption?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const id = useId();
  return (
    <section aria-labelledby={id} className={`rounded-2xl border border-soil-200 bg-white p-4 md:p-5 ${className}`}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id={id} className="text-xl font-semibold text-leaf-900">
            {title}
          </h2>
          {sample && <SampleBadge />}
        </div>
        {actions}
      </div>
      {caption && <p className="-mt-1 mb-3 text-sm text-soil-700">{caption}</p>}
      {children}
    </section>
  );
}
