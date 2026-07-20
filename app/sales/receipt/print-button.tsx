"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 print:hidden dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
    >
      Print Bill
    </button>
  );
}
