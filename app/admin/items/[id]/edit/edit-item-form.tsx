"use client";

import { useActionState } from "react";
import { updateItem } from "@/lib/actions/items";

export function EditItemForm({
  itemId,
  defaultName,
  defaultDescription,
  defaultRate,
}: {
  itemId: string;
  defaultName: string;
  defaultDescription: string;
  defaultRate: number;
}) {
  const [state, action, pending] = useActionState(
    updateItem.bind(null, itemId),
    undefined
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium text-zinc-700">
          Item Name
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={defaultName}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="text-sm font-medium text-zinc-700">
          Description (optional)
        </label>
        <textarea
          id="description"
          name="description"
          rows={2}
          defaultValue={defaultDescription}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="rate" className="text-sm font-medium text-zinc-700">
          Rate (Rs/kg)
        </label>
        <input
          id="rate"
          name="rate"
          type="number"
          step="0.01"
          min="0"
          required
          defaultValue={defaultRate}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500"
        />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && (
        <p className="text-sm text-emerald-600">{state.success}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
