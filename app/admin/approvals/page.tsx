import { getPendingSales } from "@/lib/reports";
import { formatMoney, formatKg, formatDateTime } from "@/lib/format";
import { approveSale } from "@/lib/actions/approvals";
import { RejectForm } from "./reject-form";

export default async function AdminApprovalsPage() {
  const pending = await getPendingSales();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">
          Pending Approvals
        </h1>
        <p className="text-sm text-zinc-500">
          Review new sales before they hit the ledger.
        </p>
      </div>

      {pending.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-6 text-sm text-zinc-500">
          No sales waiting for approval.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {pending.map((sale) => (
            <div
              key={sale.id}
              className="rounded-xl border border-zinc-200 bg-white p-6"
            >
              <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-zinc-900">
                    {sale.shopName} · {sale.buyerName}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {sale.salesPersonName} · {formatDateTime(sale.createdAt)}
                  </p>
                </div>
                <p className="text-lg font-semibold text-zinc-900">
                  {formatMoney(sale.totalAmount)}
                </p>
              </div>

              <div className="mb-4 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 text-zinc-500">
                      <th className="p-2 font-medium">Item</th>
                      <th className="p-2 font-medium">Kg</th>
                      <th className="p-2 font-medium">Rate</th>
                      <th className="p-2 font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sale.lines.map((line, index) => (
                      <tr
                        key={index}
                        className="border-b border-zinc-100 last:border-0"
                      >
                        <td className="p-2">{line.itemName}</td>
                        <td className="p-2">{formatKg(line.weightKg)}</td>
                        <td className="p-2">{formatMoney(line.ratePerKg)}</td>
                        <td className="p-2">{formatMoney(line.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap items-start gap-3">
                <form action={approveSale.bind(null, sale.id)}>
                  <button
                    type="submit"
                    className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
                  >
                    Approve
                  </button>
                </form>
                <RejectForm saleId={sale.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
