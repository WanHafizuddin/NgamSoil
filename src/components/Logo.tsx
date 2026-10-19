export function Logo({ tagline = false }: { tagline?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <svg aria-hidden viewBox="0 0 32 32" className="h-8 w-8 shrink-0">
        <circle cx="16" cy="16" r="11" fill="none" stroke="#9CC5A1" strokeWidth="2.5" strokeDasharray="52 17" />
        <path d="M11 21c0-6 3.5-9.5 10-10.5-.8 6.5-4.3 10-10 10.5z" fill="#E3EFE2" />
      </svg>
      <span className="leading-tight">
        <span className="block font-display text-xl font-semibold tracking-tight">RootLoop</span>
        {tagline && <span className="block text-xs text-leaf-100/80">Township compost, matched to trees</span>}
      </span>
    </span>
  );
}
