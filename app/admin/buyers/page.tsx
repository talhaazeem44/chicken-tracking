import Link from "next/link";
import { getBuyers } from "@/lib/buyers";
import { formatDateTime } from "@/lib/format";
import { setBuyerActive } from "@/lib/actions/buyers";
import { CreateBuyerForm } from "./create-buyer-form";

export default async function AdminBuyersPage() {
  const buyers = await getBuyers();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">Buyers</h1>
        <p className="text-sm text-zinc-500">
          Manage the customers your sales team can bill. Each has its own
          ledger of stock given, payments received, and pending balance.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold text-zinc-900">
            New Buyer
          </h2>
          <CreateBuyerForm />
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white">
          <div className="border-b border-zinc-200 p-4">
            <h2 className="text-sm font-semibold text-zinc-900">
              Existing Buyers
            </h2>
          </div>
          {buyers.length === 0 ? (
            <p className="p-4 text-sm text-zinc-500">No buyers yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-500">
                    <th className="p-3 font-medium">Name</th>
                    <th className="p-3 font-medium">Shop</th>
                    <th className="p-3 font-medium">Phone</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium">Added</th>
                    <th className="p-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {buyers.map((buyer) => (
                    <tr
                      key={buyer.id}
                      className="border-b border-zinc-100 last:border-0"
                    >
                      <td className="p-3">
                        <Link
                          href={`/admin/buyers/${buyer.id}`}
                          className="font-medium text-zinc-900 hover:underline"
                        >
                          {buyer.name}
                        </Link>
                      </td>
                      <td className="p-3 text-zinc-500">
                        {buyer.shopName || "—"}
                      </td>
                      <td className="p-3 text-zinc-500">
                        {buyer.phone || "—"}
                      </td>
                      <td className="p-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            buyer.active
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-zinc-100 text-zinc-500"
                          }`}
                        >
                          {buyer.active ? "Active" : "Deactivated"}
                        </span>
                      </td>
                      <td className="p-3 text-zinc-500">
                        {formatDateTime(buyer.createdAt)}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-end gap-3">
                          <Link
                            href={`/admin/buyers/${buyer.id}/edit`}
                            className="text-zinc-600 hover:underline"
                          >
                            Edit
                          </Link>
                          <form
                            action={setBuyerActive.bind(
                              null,
                              buyer.id,
                              !buyer.active
                            )}
                          >
                            <button
                              type="submit"
                              className={
                                buyer.active
                                  ? "text-red-600 hover:underline"
                                  : "text-emerald-600 hover:underline"
                              }
                            >
                              {buyer.active ? "Deactivate" : "Reactivate"}
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
