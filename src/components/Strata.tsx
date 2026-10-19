export function Strata({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden className={`flex flex-col ${className}`}>
      <span className="h-[3px] bg-leaf-500" />
      <span className="h-[4px] bg-soil-700" />
      <span className="h-[3px] bg-soil-500" />
      <span className="h-[2px] bg-soil-200" />
    </div>
  );
}
