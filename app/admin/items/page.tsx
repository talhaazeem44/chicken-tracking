import Link from "next/link";
import { getItems } from "@/lib/items";
import { formatDateTime, formatMoney } from "@/lib/format";
import { setItemActive } from "@/lib/actions/items";
import { CreateItemForm } from "./create-item-form";

export default async function AdminItemsPage() {
  const allItems = await getItems();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">Items</h1>
        <p className="text-sm text-zinc-500">
          Manage the products your sales team can stock and sell.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold text-zinc-900">
            New Item
          </h2>
          <CreateItemForm />
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white">
          <div className="border-b border-zinc-200 p-4">
            <h2 className="text-sm font-semibold text-zinc-900">
              Existing Items
            </h2>
          </div>
          {allItems.length === 0 ? (
            <p className="p-4 text-sm text-zinc-500">No items yet.</p>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500">
                  <th className="p-3 font-medium">Name</th>
                  <th className="p-3 font-medium">Rate/kg</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium">Added</th>
                  <th className="p-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {allItems.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-zinc-100 last:border-0"
                  >
                    <td className="p-3">
                      <p className="font-medium text-zinc-900">{item.name}</p>
                      {item.description && (
                        <p className="text-xs text-zinc-500">
                          {item.description}
                        </p>
                      )}
                    </td>
                    <td className="p-3">{formatMoney(item.rate)}</td>
                    <td className="p-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          item.active
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-zinc-100 text-zinc-500"
                        }`}
                      >
                        {item.active ? "Active" : "Deactivated"}
                      </span>
                    </td>
                    <td className="p-3 text-zinc-500">
                      {formatDateTime(item.createdAt)}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/admin/items/${item.id}/edit`}
                          className="text-zinc-600 hover:underline"
                        >
                          Edit
                        </Link>
                        <form
                          action={setItemActive.bind(
                            null,
                            item.id,
                            !item.active
                          )}
                        >
                          <button
                            type="submit"
                            className={
                              item.active
                                ? "text-red-600 hover:underline"
                                : "text-emerald-600 hover:underline"
                            }
                          >
                            {item.active ? "Deactivate" : "Reactivate"}
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
