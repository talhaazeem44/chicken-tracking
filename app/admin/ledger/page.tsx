import { getLedger, getSalesTeam, summarizeLedger, type LedgerPeriod } from "@/lib/reports";
import { formatMoney, formatKg, formatDateTime } from "@/lib/format";

const PERIODS: { value: LedgerPeriod; label: string }[] = [
  { value: "daily", label: "Today" },
  { value: "weekly", label: "This Week" },
  { value: "monthly", label: "This Month" },
  { value: "all", label: "All Time" },
];

export default async function AdminLedgerPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; salesPersonId?: string }>;
}) {
  const params = await searchParams;
  const period = (PERIODS.some((p) => p.value === params.period)
    ? params.period
    : "all") as LedgerPeriod;
  const salesPersonId = params.salesPersonId
    ? Number(params.salesPersonId)
    : undefined;

  const [rows, team] = await Promise.all([
    getLedger({ period, salesPersonId }),
    getSalesTeam(),
  ]);
  const summary = summarizeLedger(rows);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Ledger &amp; Reports
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Every sale recorded by your team, with margin on each transaction.
        </p>
      </div>

      <form className="flex flex-wrap items-end gap-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Period
          </label>
          <select
            name="period"
            defaultValue={period}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            {PERIODS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Sales Person
          </label>
          <select
            name="salesPersonId"
            defaultValue={salesPersonId ? String(salesPersonId) : ""}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="">All</option>
            {team.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Apply
        </button>
      </form>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard label="Sales" value={String(summary.count)} />
        <SummaryCard label="Weight Sold" value={formatKg(summary.totalWeightKg)} />
        <SummaryCard label="Revenue" value={formatMoney(summary.totalAmount)} />
        <SummaryCard
          label="Profit/Loss"
          value={formatMoney(summary.totalProfit)}
          tone={summary.totalProfit < 0 ? "negative" : "positive"}
        />
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        {rows.length === 0 ? (
          <p className="p-4 text-sm text-zinc-500 dark:text-zinc-400">
            No sales found for this filter.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                  <th className="p-3 font-medium">Date</th>
                  <th className="p-3 font-medium">Sales Person</th>
                  <th className="p-3 font-medium">Shop</th>
                  <th className="p-3 font-medium">Buyer</th>
                  <th className="p-3 font-medium">Weight</th>
                  <th className="p-3 font-medium">Rate/kg</th>
                  <th className="p-3 font-medium">Amount</th>
                  <th className="p-3 font-medium">Cost/kg</th>
                  <th className="p-3 font-medium">Profit/Loss</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-zinc-100 last:border-0 dark:border-zinc-900"
                  >
                    <td className="p-3 whitespace-nowrap text-zinc-500 dark:text-zinc-400">
                      {formatDateTime(row.createdAt)}
                    </td>
                    <td className="p-3">{row.salesPersonName}</td>
                    <td className="p-3">{row.shopName}</td>
                    <td className="p-3">{row.buyerName}</td>
                    <td className="p-3">{formatKg(row.weightKg)}</td>
                    <td className="p-3">{formatMoney(row.ratePerKg)}</td>
                    <td className="p-3">{formatMoney(row.totalAmount)}</td>
                    <td className="p-3">{formatMoney(row.costPerKgAtSale)}</td>
                    <td
                      className={`p-3 font-medium ${
                        Number(row.profit) < 0
                          ? "text-red-600 dark:text-red-400"
                          : "text-emerald-600 dark:text-emerald-400"
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

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "positive" | "negative";
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      <p
        className={`mt-1 text-lg font-semibold ${
          tone === "negative"
            ? "text-red-600 dark:text-red-400"
            : tone === "positive"
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-zinc-900 dark:text-zinc-50"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
