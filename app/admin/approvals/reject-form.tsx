"use client";

import { useActionState, useState } from "react";
import { rejectSale } from "@/lib/actions/approvals";

export function RejectForm({ saleId }: { saleId: string }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(
    rejectSale.bind(null, saleId),
    undefined
  );

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
      >
        Reject
      </button>
    );
  }

  return (
    <form action={action} className="flex flex-1 flex-col gap-2">
      <textarea
        name="reason"
        required
        placeholder="Reason for rejecting this sale..."
        rows={2}
        className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500"
      />
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
        >
          {pending ? "Rejecting..." : "Confirm Reject"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
