import Link from "next/link";
import { requireRole } from "@/lib/dal";
import { getStockSummaryByItem } from "@/lib/inventory";
import { getLedger, summarizeLedger } from "@/lib/reports";
import { formatMoney, formatKg, formatDateTime } from "@/lib/format";

export default async function SalesDashboardPage() {
  const session = await requireRole("sales");

  const [stockByItem, todayRows, pendingRows, rejectedRows] = await Promise.all([
    getStockSummaryByItem(session.userId),
    getLedger({ period: "daily", salesPersonId: session.userId }),
    getLedger({ period: "all", salesPersonId: session.userId, status: "pending" }),
    getLedger({ period: "all", salesPersonId: session.userId, status: "rejected" }),
  ]);
  const today = summarizeLedger(todayRows);
  const recentRejected = rejectedRows.slice(0, 5);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">
            Welcome, {session.name}
          </h1>
          <p className="text-sm text-zinc-500">
            Here&apos;s your stock and sales for today.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/sales/stock"
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
          >
            Add Stock
          </Link>
          <Link
            href="/sales/new-sale"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
          >
            New Sale
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Today's Sales" value={String(today.count)} />
        <StatCard label="Today's Revenue" value={formatMoney(today.totalAmount)} />
        <StatCard label="Pending Approval" value={String(pendingRows.length)} />
      </div>

      {pendingRows.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="mb-2 text-sm font-semibold text-amber-800">
            Awaiting Admin Approval
          </p>
          <ul className="flex flex-col gap-1 text-sm text-amber-700">
            {pendingRows.map((row) => (
              <li key={row.id} className="flex justify-between">
                <span>
                  {row.shopName} · {row.buyerName} — {row.itemsSummary}
                </span>
                <span>{formatMoney(row.totalAmount)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {recentRejected.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="mb-2 text-sm font-semibold text-red-800">
            Recently Rejected
          </p>
          <ul className="flex flex-col gap-2 text-sm text-red-700">
            {recentRejected.map((row) => (
              <li key={row.id}>
                <div className="flex justify-between">
                  <span>
                    {row.shopName} · {row.buyerName} — {row.itemsSummary}
                  </span>
                  <span>{formatMoney(row.totalAmount)}</span>
                </div>
                {row.rejectionReason && (
                  <p className="text-xs text-red-600">
                    Reason: {row.rejectionReason}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <p className="mb-3 text-xs font-medium text-zinc-500">
          Stock by Item
        </p>
        {stockByItem.length === 0 ? (
          <p className="text-sm text-zinc-500">No items yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {stockByItem.map((item) => (
              <div
                key={item.itemId}
                className="rounded-lg border border-zinc-100 p-3"
              >
                <p className="text-sm font-medium text-zinc-900">
                  {item.itemName}
                </p>
                <p className="mt-1 text-lg font-semibold text-zinc-900">
                  {formatKg(item.balanceKg)}
                </p>
                <p className="text-xs text-zinc-500">
                  Avg cost {formatMoney(item.avgCostPerKg)}/kg
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white">
        <div className="flex items-center justify-between border-b border-zinc-200 p-4">
          <h2 className="text-sm font-semibold text-zinc-900">
            Today&apos;s Sales
          </h2>
          <Link
            href="/sales/ledger"
            className="text-sm font-medium text-zinc-600 hover:underline"
          >
            View all my sales →
          </Link>
        </div>
        {todayRows.length === 0 ? (
          <p className="p-4 text-sm text-zinc-500">
            No sales recorded today yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500">
                  <th className="p-3 font-medium">Time</th>
                  <th className="p-3 font-medium">Items</th>
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
                    className="border-b border-zinc-100 last:border-0"
                  >
                    <td className="p-3 whitespace-nowrap text-zinc-500">
                      {formatDateTime(row.createdAt)}
                    </td>
                    <td className="p-3">{row.itemsSummary}</td>
                    <td className="p-3">{row.shopName}</td>
                    <td className="p-3">{row.buyerName}</td>
                    <td className="p-3">{formatKg(row.weightKg)}</td>
                    <td className="p-3">{formatMoney(row.totalAmount)}</td>
                    <td className="p-3">
                      <Link
                        href={`/sales/receipt/${row.id}`}
                        className="text-zinc-600 hover:underline"
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
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <p className="text-xs font-medium text-zinc-500">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold text-zinc-900">
        {value}
      </p>
    </div>
  );
}
