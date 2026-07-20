import { requireRole } from "@/lib/dal";
import { getStockSummary } from "@/lib/inventory";
import { NewSaleForm } from "./new-sale-form";

export default async function NewSalePage() {
  const session = await requireRole("sales");
  const stock = await getStockSummary(session.userId);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">
          New Sale
        </h1>
        <p className="text-sm text-zinc-500">
          Record a sale to a shop and print the bill.
        </p>
      </div>

      <div className="max-w-md rounded-xl border border-zinc-200 bg-white p-6">
        <NewSaleForm balanceKg={stock.balanceKg} />
      </div>
    </div>
  );
}
