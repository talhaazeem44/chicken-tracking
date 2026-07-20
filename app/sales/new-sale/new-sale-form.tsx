"use client";

import { useActionState } from "react";
import { createSale } from "@/lib/actions/sales";

export function NewSaleForm({ balanceKg }: { balanceKg: number }) {
  const [state, action, pending] = useActionState(createSale, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="shopName" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Shop Name
        </label>
        <input
          id="shopName"
          name="shopName"
          required
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="buyerName" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Buyer Name
        </label>
        <input
          id="buyerName"
          name="buyerName"
          required
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="weightKg" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Weight Sold (kg)
        </label>
        <input
          id="weightKg"
          name="weightKg"
          type="number"
          step="0.01"
          min="0.01"
          max={balanceKg || undefined}
          required
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
        />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {balanceKg.toFixed(2)}kg available
        </p>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="totalAmount" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Total Bill (Rs)
        </label>
        <input
          id="totalAmount"
          name="totalAmount"
          type="number"
          step="0.01"
          min="0.01"
          required
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>
      {state?.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending || balanceKg <= 0}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        {pending ? "Saving..." : "Save & Print Bill"}
      </button>
      {balanceKg <= 0 && (
        <p className="text-sm text-amber-600 dark:text-amber-400">
          You have no stock left. Add stock first.
        </p>
      )}
    </form>
  );
}
