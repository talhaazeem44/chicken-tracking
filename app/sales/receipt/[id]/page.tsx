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
  const sale = await getSaleById(Number(id));

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

      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8 print:rounded-none print:border-0 print:p-4">
        <div className="mb-6 text-center">
          <h1 className="text-lg font-bold text-zinc-900 print:text-black">
            Poultry Chicken
          </h1>
          <p className="text-xs text-zinc-500 print:text-black">
            Sales Receipt
          </p>
        </div>

        <div className="mb-6 flex justify-between text-sm text-zinc-500 print:text-black">
          <span>Bill #{sale.id}</span>
          <span>{formatDateTime(sale.createdAt)}</span>
        </div>

        <dl className="mb-6 flex flex-col gap-2 text-sm">
          <Row label="Shop" value={sale.shopName} />
          <Row label="Buyer" value={sale.buyerName} />
          <Row label="Sold By" value={sale.salesPersonName} />
        </dl>

        <div className="mb-6 border-y border-dashed border-zinc-300 py-4 text-sm print:border-black">
          <div className="flex justify-between py-1">
            <span className="text-zinc-500 print:text-black">Weight</span>
            <span className="font-medium text-zinc-900 print:text-black">
              {formatKg(sale.weightKg)}
            </span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-zinc-500 print:text-black">Rate / kg</span>
            <span className="font-medium text-zinc-900 print:text-black">
              {formatMoney(sale.ratePerKg)}
            </span>
          </div>
        </div>

        <div className="flex justify-between text-lg font-bold text-zinc-900 print:text-black">
          <span>Total</span>
          <span>{formatMoney(sale.totalAmount)}</span>
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
