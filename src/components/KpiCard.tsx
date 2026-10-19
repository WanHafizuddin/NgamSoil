import type { LucideIcon } from 'lucide-react';

export function KpiCard({
  label,
  value,
  caption,
  icon: Icon,
  featured = false,
  compact = false,
}: {
  label: string;
  value: string;
  caption?: string;
  icon: LucideIcon;
  featured?: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-1 rounded-2xl p-4 ${
        featured ? 'col-span-2 bg-leaf-900 text-soil-50 md:col-span-1 md:row-span-2' : 'border border-soil-200 bg-white'
      }`}
    >
      <span className={`flex items-center gap-2 text-sm font-bold ${featured ? 'text-leaf-100' : 'text-soil-700'}`}>
        <Icon aria-hidden className="h-4 w-4" />
        {label}
      </span>
      <span
        className={`font-display font-semibold tracking-tight ${
          featured ? 'mt-auto text-5xl md:text-6xl' : compact ? 'text-lg leading-snug text-leaf-900' : 'text-2xl text-leaf-900'
        }`}
      >
        {value}
      </span>
      {caption && <span className={`text-xs ${featured ? 'text-leaf-100/90' : 'text-soil-700'}`}>{caption}</span>}
    </div>
  );
}
