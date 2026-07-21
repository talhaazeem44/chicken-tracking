import Link from "next/link";
import { requireRole } from "@/lib/dal";
import { getLedger, summarizeLedger, type LedgerPeriod } from "@/lib/reports";
import { formatMoney, formatKg, formatDateTime } from "@/lib/format";

const PERIODS: { value: LedgerPeriod; label: string }[] = [
  { value: "daily", label: "Today" },
  { value: "weekly", label: "This Week" },
  { value: "monthly", label: "This Month" },
  { value: "all", label: "All Time" },
];

export default async function SalesLedgerPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const session = await requireRole("sales");
  const params = await searchParams;
  const period = (PERIODS.some((p) => p.value === params.period)
    ? params.period
    : "all") as LedgerPeriod;

  const rows = await getLedger({ period, salesPersonId: session.userId });
  const summary = summarizeLedger(rows);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">
            My Sales
          </h1>
          <p className="text-sm text-zinc-500">
            Your sales history and totals.
          </p>
        </div>
        <a
          href={`/sales/ledger/export?period=${period}`}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
        >
          Export to Excel
        </a>
      </div>

      <form className="flex flex-wrap items-end gap-4 rounded-xl border border-zinc-200 bg-white p-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-500">
            Period
          </label>
          <select
            name="period"
            defaultValue={period}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
          >
            {PERIODS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
        >
          Apply
        </button>
      </form>

      <div className="grid grid-cols-3 gap-4">
        <SummaryCard label="Sales" value={String(summary.count)} />
        <SummaryCard label="Weight Sold" value={formatKg(summary.totalWeightKg)} />
        <SummaryCard label="Revenue" value={formatMoney(summary.totalAmount)} />
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white">
        {rows.length === 0 ? (
          <p className="p-4 text-sm text-zinc-500">
            No sales found for this filter.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500">
                  <th className="p-3 font-medium">Date</th>
                  <th className="p-3 font-medium">Shop</th>
                  <th className="p-3 font-medium">Buyer</th>
                  <th className="p-3 font-medium">Weight</th>
                  <th className="p-3 font-medium">Amount</th>
                  <th className="p-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-zinc-100 last:border-0"
                  >
                    <td className="p-3 whitespace-nowrap text-zinc-500">
                      {formatDateTime(row.createdAt)}
                    </td>
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

function SummaryCard({ label, value }: { label: string; value: string }) {
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
