"use client";

import { useActionState } from "react";
import { updateBuyer } from "@/lib/actions/buyers";

export function EditBuyerForm({
  buyerId,
  defaultName,
  defaultShopName,
  defaultPhone,
  defaultAddress,
}: {
  buyerId: string;
  defaultName: string;
  defaultShopName: string;
  defaultPhone: string;
  defaultAddress: string;
}) {
  const [state, action, pending] = useActionState(
    updateBuyer.bind(null, buyerId),
    undefined
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium text-zinc-700">
          Buyer Name
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={defaultName}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-base outline-none focus:border-zinc-500 sm:text-sm"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="shopName" className="text-sm font-medium text-zinc-700">
          Shop Name (optional)
        </label>
        <input
          id="shopName"
          name="shopName"
          defaultValue={defaultShopName}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-base outline-none focus:border-zinc-500 sm:text-sm"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="phone" className="text-sm font-medium text-zinc-700">
          Phone (optional)
        </label>
        <input
          id="phone"
          name="phone"
          defaultValue={defaultPhone}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-base outline-none focus:border-zinc-500 sm:text-sm"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="address" className="text-sm font-medium text-zinc-700">
          Address (optional)
        </label>
        <textarea
          id="address"
          name="address"
          rows={2}
          defaultValue={defaultAddress}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-base outline-none focus:border-zinc-500 sm:text-sm"
        />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && (
        <p className="text-sm text-emerald-600">{state.success}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
