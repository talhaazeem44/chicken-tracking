import Link from "next/link";
import { notFound } from "next/navigation";
import { getBuyerById } from "@/lib/buyers";
import { getLedger, summarizeLedger, type LedgerPeriod } from "@/lib/reports";
import { formatMoney, formatKg, formatDateTime } from "@/lib/format";

const PERIODS: { value: LedgerPeriod; label: string }[] = [
  { value: "daily", label: "Today" },
  { value: "weekly", label: "This Week" },
  { value: "monthly", label: "This Month" },
  { value: "all", label: "All Time" },
];

export default async function BuyerStatementPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ period?: string }>;
}) {
  const { id } = await params;
  const buyer = await getBuyerById(id);
  if (!buyer) notFound();

  const query = await searchParams;
  const period = (PERIODS.some((p) => p.value === query.period)
    ? query.period
    : "all") as LedgerPeriod;

  const rows = await getLedger({ period, buyerId: id });
  const summary = summarizeLedger(rows);

  const exportParams = new URLSearchParams({ period, buyerId: id });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/buyers"
            className="text-sm font-medium text-zinc-600 hover:underline"
          >
            ← Back to Buyers
          </Link>
          <h1 className="mt-2 text-xl font-semibold text-zinc-900">
            {buyer.name}
          </h1>
          <p className="text-sm text-zinc-500">
            {[buyer.shopName, buyer.phone].filter(Boolean).join(" · ") ||
              "No shop or phone on file."}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/admin/buyers/${buyer.id}/edit`}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
          >
            Edit Buyer
          </Link>
          <a
            href={`/admin/ledger/export?${exportParams.toString()}`}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
          >
            Export to Excel
          </a>
        </div>
      </div>

      <form className="flex flex-wrap items-end gap-4 rounded-xl border border-zinc-200 bg-white p-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-500">Period</label>
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

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard label="Bills" value={String(summary.count)} />
        <SummaryCard label="Stock Given" value={formatKg(summary.totalWeightKg)} />
        <SummaryCard label="Total Billed" value={formatMoney(summary.totalAmount)} />
        <SummaryCard label="Received" value={formatMoney(summary.totalReceived)} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SummaryCard
          label="Pending Balance"
          value={formatMoney(summary.totalPending)}
          tone={summary.totalPending > 0 ? "negative" : "positive"}
        />
        <SummaryCard
          label="Profit/Loss"
          value={formatMoney(summary.totalProfit)}
          tone={summary.totalProfit < 0 ? "negative" : "positive"}
        />
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 p-4">
          <h2 className="text-sm font-semibold text-zinc-900">
            Transaction History
          </h2>
        </div>
        {rows.length === 0 ? (
          <p className="p-4 text-sm text-zinc-500">
            No approved sales for this buyer in this period.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500">
                  <th className="p-3 font-medium">Date</th>
                  <th className="p-3 font-medium">Sales Person</th>
                  <th className="p-3 font-medium">Items</th>
                  <th className="p-3 font-medium">Weight</th>
                  <th className="p-3 font-medium">Amount</th>
                  <th className="p-3 font-medium">Received</th>
                  <th className="p-3 font-medium">Pending</th>
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
                    <td className="p-3">{row.salesPersonName}</td>
                    <td className="p-3">{row.itemsSummary}</td>
                    <td className="p-3">{formatKg(row.weightKg)}</td>
                    <td className="p-3">{formatMoney(row.totalAmount)}</td>
                    <td className="p-3">{formatMoney(row.amountReceived)}</td>
                    <td
                      className={`p-3 font-medium ${
                        row.amountPending > 0
                          ? "text-amber-600"
                          : "text-emerald-600"
                      }`}
                    >
                      {formatMoney(row.amountPending)}
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
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <p className="text-xs font-medium text-zinc-500">{label}</p>
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
