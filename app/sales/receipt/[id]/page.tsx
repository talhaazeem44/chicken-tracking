import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireRole } from "@/lib/dal";
import { getSaleById } from "@/lib/reports";
import { formatMoney, formatKg, formatDateTime } from "@/lib/format";
import { PrintButton } from "../print-button";

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole("sales");
  const { id } = await params;
  const sale = await getSaleById(id);

  if (!sale) notFound();
  if (sale.salesPersonId !== session.userId) redirect("/sales");

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex w-full max-w-md items-center justify-between print:hidden">
        <Link
          href="/sales"
          className="text-sm font-medium text-zinc-600 hover:underline"
        >
          ← Back to dashboard
        </Link>
        <PrintButton />
      </div>

      {sale.status !== "approved" && (
        <div
          className={`w-full max-w-md rounded-md px-4 py-2 text-sm font-medium print:hidden ${
            sale.status === "rejected"
              ? "bg-red-100 text-red-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {sale.status === "pending" &&
            "Awaiting admin approval. It will appear in the ledger once approved."}
          {sale.status === "rejected" &&
            `Rejected by admin: ${sale.rejectionReason}`}
        </div>
      )}

      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8 print:rounded-none print:border-0 print:p-4">
        <div className="mb-6 text-center">
          <h1 className="text-lg font-bold text-zinc-900 print:text-black">
            Poultry Chicken
          </h1>
          <p className="text-xs text-zinc-500 print:text-black">
            Sales Receipt
          </p>
        </div>

        <div className="mb-4 flex justify-between text-sm text-zinc-500 print:text-black">
          <span>Bill #{sale.id.slice(-6).toUpperCase()}</span>
          <span>{formatDateTime(sale.createdAt)}</span>
        </div>

        <dl className="mb-4 flex flex-col gap-2 text-sm">
          <Row label="Shop" value={sale.shopName} />
          <Row label="Buyer" value={sale.buyerName} />
          <Row label="Sold By" value={sale.salesPersonName} />
        </dl>

        <div className="mb-4 border-y border-dashed border-zinc-300 py-2 print:border-black">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-zinc-500 print:text-black">
                <th className="py-1 text-left font-medium">Item</th>
                <th className="py-1 text-right font-medium">Kg</th>
                <th className="py-1 text-right font-medium">Rate</th>
                <th className="py-1 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {sale.lines.map((line, index) => (
                <tr key={index} className="text-zinc-900 print:text-black">
                  <td className="py-1">{line.itemName}</td>
                  <td className="py-1 text-right">{formatKg(line.weightKg)}</td>
                  <td className="py-1 text-right">{formatMoney(line.ratePerKg)}</td>
                  <td className="py-1 text-right">{formatMoney(line.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between text-lg font-bold text-zinc-900 print:text-black">
          <span>Total</span>
          <span>{formatMoney(sale.totalAmount)}</span>
        </div>

        <div className="mt-2 flex flex-col gap-1 text-sm print:text-black">
          <div className="flex justify-between">
            <span className="text-zinc-500 print:text-black">Received</span>
            <span className="font-medium text-zinc-900 print:text-black">
              {formatMoney(sale.amountReceived)}
            </span>
          </div>
          {sale.amountPending > 0 && (
            <div className="flex justify-between">
              <span className="text-zinc-500 print:text-black">
                Balance Due
              </span>
              <span className="font-medium text-red-600 print:text-black">
                {formatMoney(sale.amountPending)}
              </span>
            </div>
          )}
        </div>

        <p className="mt-8 text-center text-xs text-zinc-400 print:text-black">
          Thank you for your business.
        </p>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-zinc-500 print:text-black">{label}</dt>
      <dd className="font-medium text-zinc-900 print:text-black">
        {value}
      </dd>
    </div>
  );
}
