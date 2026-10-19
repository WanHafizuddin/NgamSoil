import { FlaskConical } from 'lucide-react';

export function SampleBadge() {
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-sun-100 px-2 py-0.5 text-xs font-bold text-soil-900 ring-1 ring-sun-400/60">
      <FlaskConical aria-hidden className="h-3.5 w-3.5" />
      Sample data
    </span>
  );
}
