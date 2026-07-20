import Link from "next/link";
import { requireRole } from "@/lib/dal";
import { getStockSummary } from "@/lib/inventory";
import { getLedger, summarizeLedger } from "@/lib/reports";
import { formatMoney, formatKg, formatDateTime } from "@/lib/format";

export default async function SalesDashboardPage() {
  const session = await requireRole("sales");

  const [stock, todayRows] = await Promise.all([
    getStockSummary(session.userId),
    getLedger({ period: "daily", salesPersonId: session.userId }),
  ]);
  const today = summarizeLedger(todayRows);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Welcome, {session.name}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Here&apos;s your stock and sales for today.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/sales/stock"
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            Add Stock
          </Link>
          <Link
            href="/sales/new-sale"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            New Sale
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Stock Remaining" value={formatKg(stock.balanceKg)} />
        <StatCard label="Avg Cost/kg" value={formatMoney(stock.avgCostPerKg)} />
        <StatCard label="Today's Sales" value={String(today.count)} />
        <StatCard label="Today's Revenue" value={formatMoney(today.totalAmount)} />
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-between border-b border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Today&apos;s Sales
          </h2>
          <Link
            href="/sales/ledger"
            className="text-sm font-medium text-zinc-600 hover:underline dark:text-zinc-400"
          >
            View all my sales →
          </Link>
        </div>
        {todayRows.length === 0 ? (
          <p className="p-4 text-sm text-zinc-500 dark:text-zinc-400">
            No sales recorded today yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                  <th className="p-3 font-medium">Time</th>
                  <th className="p-3 font-medium">Shop</th>
                  <th className="p-3 font-medium">Buyer</th>
                  <th className="p-3 font-medium">Weight</th>
                  <th className="p-3 font-medium">Amount</th>
                  <th className="p-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {todayRows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-zinc-100 last:border-0 dark:border-zinc-900"
                  >
                    <td className="p-3 whitespace-nowrap text-zinc-500 dark:text-zinc-400">
                      {formatDateTime(row.createdAt)}
                    </td>
                    <td className="p-3">{row.shopName}</td>
                    <td className="p-3">{row.buyerName}</td>
                    <td className="p-3">{formatKg(row.weightKg)}</td>
                    <td className="p-3">{formatMoney(row.totalAmount)}</td>
                    <td className="p-3">
                      <Link
                        href={`/sales/receipt/${row.id}`}
                        className="text-zinc-600 hover:underline dark:text-zinc-400"
                      >
                        Print
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        {value}
      </p>
    </div>
  );
}
