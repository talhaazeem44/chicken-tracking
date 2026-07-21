import { requireRole } from "@/lib/dal";
import { getStockSummaryByItem, getInventoryHistory } from "@/lib/inventory";
import { getActiveItems } from "@/lib/items";
import { formatMoney, formatKg, formatDateTime } from "@/lib/format";
import { AddStockForm } from "./add-stock-form";

export default async function StockPage() {
  const session = await requireRole("sales");
  const [stockByItem, history, activeItems] = await Promise.all([
    getStockSummaryByItem(session.userId),
    getInventoryHistory(session.userId),
    getActiveItems(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">
          Stock
        </h1>
        <p className="text-sm text-zinc-500">
          Record items you&apos;ve picked up, and track what you have left.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="flex flex-col gap-6">
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="mb-3 text-xs font-medium text-zinc-500">
              Current Balance
            </p>
            {stockByItem.length === 0 ? (
              <p className="text-sm text-zinc-500">No items yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {stockByItem.map((item) => (
                  <div
                    key={item.itemId}
                    className="flex items-center justify-between border-b border-zinc-100 pb-2 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-zinc-900">
                        {item.itemName}
                        {!item.active && (
                          <span className="ml-2 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500">
                            Discontinued
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-zinc-500">
                        Avg cost {formatMoney(item.avgCostPerKg)}/kg
                      </p>
                    </div>
                    <p className="text-lg font-semibold text-zinc-900">
                      {formatKg(item.balanceKg)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold text-zinc-900">
              Add Stock
            </h2>
            <AddStockForm items={activeItems} />
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white">
          <div className="border-b border-zinc-200 p-4">
            <h2 className="text-sm font-semibold text-zinc-900">
              Stock History
            </h2>
          </div>
          {history.length === 0 ? (
            <p className="p-4 text-sm text-zinc-500">
              No stock added yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-500">
                    <th className="p-3 font-medium">Date</th>
                    <th className="p-3 font-medium">Item</th>
                    <th className="p-3 font-medium">Weight</th>
                    <th className="p-3 font-medium">Cost/kg</th>
                    <th className="p-3 font-medium">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((entry) => (
                    <tr
                      key={entry.id}
                      className="border-b border-zinc-100 last:border-0"
                    >
                      <td className="p-3 whitespace-nowrap text-zinc-500">
                        {formatDateTime(entry.createdAt)}
                      </td>
                      <td className="p-3">{entry.itemName}</td>
                      <td className="p-3">{formatKg(entry.weightKg)}</td>
                      <td className="p-3">{formatMoney(entry.costPerKg)}</td>
                      <td className="p-3 text-zinc-500">
                        {entry.note || "—"}
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
