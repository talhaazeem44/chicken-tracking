"use client";

import { useActionState, useRef, useEffect } from "react";
import { addStock } from "@/lib/actions/inventory";

export function AddStockForm() {
  const [state, action, pending] = useActionState(addStock, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="weightKg"className="text-sm font-medium text-zinc-700">
          Weight Received (kg)
        </label>
        <input
          id="weightKg"
          name="weightKg"
          type="number"
          step="0.01"
          min="0.01"
          required
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="costPerKg"className="text-sm font-medium text-zinc-700">
          Cost per kg (Rs)
        </label>
        <input
          id="costPerKg"
          name="costPerKg"
          type="number"
          step="0.01"
          min="0"
          required
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="note"className="text-sm font-medium text-zinc-700">
          Note (optional)
        </label>
        <input
          id="note"
          name="note"
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500"
        />
      </div>
      {state?.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-sm text-emerald-600">{state.success}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
      >
        {pending ? "Adding..." : "Add Stock"}
      </button>
    </form>
  );
}
