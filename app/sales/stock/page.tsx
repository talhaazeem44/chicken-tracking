import { requireRole } from "@/lib/dal";
import { getStockSummary, getInventoryHistory } from "@/lib/inventory";
import { formatMoney, formatKg, formatDateTime } from "@/lib/format";
import { AddStockForm } from "./add-stock-form";

export default async function StockPage() {
  const session = await requireRole("sales");
  const [stock, history] = await Promise.all([
    getStockSummary(session.userId),
    getInventoryHistory(session.userId),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Stock
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Record chicken you&apos;ve picked up, and track what you have left.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="flex flex-col gap-6">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Current Balance
            </p>
            <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {formatKg(stock.balanceKg)}
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Avg cost {formatMoney(stock.avgCostPerKg)}/kg
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Add Stock
            </h2>
            <AddStockForm />
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Stock History
            </h2>
          </div>
          {history.length === 0 ? (
            <p className="p-4 text-sm text-zinc-500 dark:text-zinc-400">
              No stock added yet.
            </p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                  <th className="p-3 font-medium">Date</th>
                  <th className="p-3 font-medium">Weight</th>
                  <th className="p-3 font-medium">Cost/kg</th>
                  <th className="p-3 font-medium">Note</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-zinc-100 last:border-0 dark:border-zinc-900"
                  >
                    <td className="p-3 whitespace-nowrap text-zinc-500 dark:text-zinc-400">
                      {formatDateTime(entry.createdAt)}
                    </td>
                    <td className="p-3">{formatKg(entry.weightKg)}</td>
                    <td className="p-3">{formatMoney(entry.costPerKg)}</td>
                    <td className="p-3 text-zinc-500 dark:text-zinc-400">
                      {entry.note || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
