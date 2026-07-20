import "server-only";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { inventoryEntries, sales } from "@/lib/db/schema";

export type StockSummary = {
  totalReceivedKg: number;
  avgCostPerKg: number;
  totalSoldKg: number;
  balanceKg: number;
};

// Weighted-average cost across all stock ever received by this sales
// person, used as the cost basis for profit/loss on new sales.
export async function getStockSummary(
  salesPersonId: number
): Promise<StockSummary> {
  const [received] = await db
    .select({
      totalWeight: sql<string>`coalesce(sum(${inventoryEntries.weightKg}), 0)`,
      totalCost: sql<string>`coalesce(sum(${inventoryEntries.weightKg} * ${inventoryEntries.costPerKg}), 0)`,
    })
    .from(inventoryEntries)
    .where(eq(inventoryEntries.salesPersonId, salesPersonId));

  const [sold] = await db
    .select({
      totalWeight: sql<string>`coalesce(sum(${sales.weightKg}), 0)`,
    })
    .from(sales)
    .where(eq(sales.salesPersonId, salesPersonId));

  const totalReceivedKg = Number(received?.totalWeight ?? 0);
  const totalCost = Number(received?.totalCost ?? 0);
  const totalSoldKg = Number(sold?.totalWeight ?? 0);

  return {
    totalReceivedKg,
    avgCostPerKg: totalReceivedKg > 0 ? totalCost / totalReceivedKg : 0,
    totalSoldKg,
    balanceKg: totalReceivedKg - totalSoldKg,
  };
}

export async function getInventoryHistory(salesPersonId: number) {
  return db
    .select()
    .from(inventoryEntries)
    .where(eq(inventoryEntries.salesPersonId, salesPersonId))
    .orderBy(desc(inventoryEntries.createdAt));
}
