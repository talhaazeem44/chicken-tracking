import { requireRole } from "@/lib/dal";
import { getStockSummaryByItem } from "@/lib/inventory";
import { getItems } from "@/lib/items";
import { getActiveBuyers } from "@/lib/buyers";
import { NewSaleForm } from "./new-sale-form";

export default async function NewSalePage() {
  const session = await requireRole("sales");
  const [stockByItem, items, buyers] = await Promise.all([
    getStockSummaryByItem(session.userId),
    getItems(),
    getActiveBuyers(),
  ]);

  const itemMap = new Map(items.map((item) => [item.id, item]));

  // Sellable items: still active, or discontinued but with leftover stock
  // to sell off.
  const sellableItems = stockByItem
    .filter((item) => item.active || item.balanceKg > 0)
    .map((item) => ({
      id: item.itemId,
      name: item.itemName,
      rate: itemMap.get(item.itemId)?.rate ?? 0,
      balanceKg: item.balanceKg,
    }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">
          New Sale
        </h1>
        <p className="text-sm text-zinc-500">
          Add one or more items to the bill, then save and print.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-6 md:max-w-2xl">
        <NewSaleForm
          items={sellableItems}
          buyers={buyers.map((b) => ({
            id: b.id,
            name: b.shopName ? `${b.name} — ${b.shopName}` : b.name,
          }))}
        />
      </div>
    </div>
  );
}
