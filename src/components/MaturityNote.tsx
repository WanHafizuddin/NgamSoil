import { Info } from 'lucide-react';

export function MaturityNote({ className = '' }: { className?: string }) {
  return (
    <p className={`flex gap-2 rounded-xl border border-water-500/30 bg-water-100 p-3 text-sm text-water-700 ${className}`}>
      <Info aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
      <span>This test shows compost maturity, not that it is free of pathogens.</span>
    </p>
  );
}
