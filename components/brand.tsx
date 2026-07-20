export function Brand({ subtitle }: { subtitle?: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xl">
        🐔
      </span>
      <div>
        <p className="text-sm font-semibold text-zinc-900">Poultry Chicken</p>
        {subtitle && <p className="text-xs text-zinc-500">{subtitle}</p>}
      </div>
    </div>
  );
}
