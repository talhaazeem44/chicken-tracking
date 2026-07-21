import Link from "next/link";
import { getLedger, getPendingSales, summarizeLedger } from "@/lib/reports";
import { formatMoney, formatKg, formatDateTime } from "@/lib/format";

export default async function AdminDashboardPage() {
  const [todayRows, allRows, pending] = await Promise.all([
    getLedger({ period: "daily" }),
    getLedger({ period: "all" }),
    getPendingSales(),
  ]);

  const today = summarizeLedger(todayRows);
  const overall = summarizeLedger(allRows);
  const recent = allRows.slice(0, 8);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">
          Dashboard
        </h1>
        <p className="text-sm text-zinc-500">
          Overview of sales across the whole team.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Link href="/admin/approvals" className="block">
          <StatCard
            label="Pending Approvals"
            value={String(pending.length)}
            tone={pending.length > 0 ? "negative" : undefined}
          />
        </Link>
        <StatCard label="Today's Sales" value={String(today.count)} />
        <StatCard label="Today's Revenue" value={formatMoney(today.totalAmount)} />
        <StatCard
          label="Today's Profit/Loss"
          value={formatMoney(today.totalProfit)}
          tone={today.totalProfit < 0 ? "negative" : "positive"}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <StatCard label="All-time Revenue" value={formatMoney(overall.totalAmount)} />
        <StatCard
          label="All-time Profit/Loss"
          value={formatMoney(overall.totalProfit)}
          tone={overall.totalProfit < 0 ? "negative" : "positive"}
        />
        <StatCard label="All-time Sales" value={String(overall.count)} />
        <StatCard label="Total Weight Sold (all-time)" value={formatKg(overall.totalWeightKg)} />
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white">
        <div className="flex items-center justify-between border-b border-zinc-200 p-4">
          <h2 className="text-sm font-semibold text-zinc-900">
            Recent Sales
          </h2>
          <Link
            href="/admin/ledger"
            className="text-sm font-medium text-zinc-600 hover:underline"
          >
            View full ledger →
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="p-4 text-sm text-zinc-500">
            No sales recorded yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500">
                  <th className="p-3 font-medium">Date</th>
                  <th className="p-3 font-medium">Sales Person</th>
                  <th className="p-3 font-medium">Items</th>
                  <th className="p-3 font-medium">Shop</th>
                  <th className="p-3 font-medium">Buyer</th>
                  <th className="p-3 font-medium">Weight</th>
                  <th className="p-3 font-medium">Amount</th>
                  <th className="p-3 font-medium">Profit/Loss</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-zinc-100 last:border-0"
                  >
                    <td className="p-3 whitespace-nowrap text-zinc-500">
                      {formatDateTime(row.createdAt)}
                    </td>
                    <td className="p-3">{row.salesPersonName}</td>
                    <td className="p-3">{row.itemsSummary}</td>
                    <td className="p-3">{row.shopName}</td>
                    <td className="p-3">{row.buyerName}</td>
                    <td className="p-3">{formatKg(row.weightKg)}</td>
                    <td className="p-3">{formatMoney(row.totalAmount)}</td>
                    <td
                      className={`p-3 font-medium ${
                        row.profit < 0 ? "text-red-600" : "text-emerald-600"
                      }`}
                    >
                      {formatMoney(row.profit)}
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

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "positive" | "negative";
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <p className="text-xs font-medium text-zinc-500">
        {label}
      </p>
      <p
        className={`mt-1 text-lg font-semibold ${
          tone === "negative"
            ? "text-red-600"
            : tone === "positive"
              ? "text-emerald-600"
              : "text-zinc-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
