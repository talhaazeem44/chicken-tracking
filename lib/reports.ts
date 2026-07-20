import "server-only";
import { and, desc, eq, gte } from "drizzle-orm";
import { db } from "@/lib/db";
import { sales, users } from "@/lib/db/schema";

export type LedgerPeriod = "daily" | "weekly" | "monthly" | "all";

export function periodStartDate(period: LedgerPeriod): Date | null {
  const now = new Date();
  if (period === "daily") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  if (period === "weekly") {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    start.setDate(start.getDate() - 6);
    return start;
  }
  if (period === "monthly") {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
  return null;
}

export type LedgerRow = {
  id: number;
  shopName: string;
  buyerName: string;
  weightKg: string;
  ratePerKg: string;
  totalAmount: string;
  costPerKgAtSale: string;
  profit: string;
  createdAt: Date;
  salesPersonName: string;
};

export async function getLedger({
  period = "all",
  salesPersonId,
}: {
  period?: LedgerPeriod;
  salesPersonId?: number;
}): Promise<LedgerRow[]> {
  const start = periodStartDate(period);
  const conditions = [];
  if (start) conditions.push(gte(sales.createdAt, start));
  if (salesPersonId) conditions.push(eq(sales.salesPersonId, salesPersonId));

  return db
    .select({
      id: sales.id,
      shopName: sales.shopName,
      buyerName: sales.buyerName,
      weightKg: sales.weightKg,
      ratePerKg: sales.ratePerKg,
      totalAmount: sales.totalAmount,
      costPerKgAtSale: sales.costPerKgAtSale,
      profit: sales.profit,
      createdAt: sales.createdAt,
      salesPersonName: users.name,
    })
    .from(sales)
    .innerJoin(users, eq(sales.salesPersonId, users.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(sales.createdAt));
}

export function summarizeLedger(rows: LedgerRow[]) {
  return rows.reduce(
    (acc, row) => {
      acc.totalWeightKg += Number(row.weightKg);
      acc.totalAmount += Number(row.totalAmount);
      acc.totalProfit += Number(row.profit);
      acc.count += 1;
      return acc;
    },
    { totalWeightKg: 0, totalAmount: 0, totalProfit: 0, count: 0 }
  );
}

export async function getSaleById(id: number) {
  const [row] = await db
    .select({
      id: sales.id,
      shopName: sales.shopName,
      buyerName: sales.buyerName,
      weightKg: sales.weightKg,
      ratePerKg: sales.ratePerKg,
      totalAmount: sales.totalAmount,
      costPerKgAtSale: sales.costPerKgAtSale,
      profit: sales.profit,
      createdAt: sales.createdAt,
      salesPersonName: users.name,
      salesPersonId: sales.salesPersonId,
    })
    .from(sales)
    .innerJoin(users, eq(sales.salesPersonId, users.id))
    .where(eq(sales.id, id));

  return row ?? null;
}

export async function getSalesTeam() {
  return db
    .select({
      id: users.id,
      name: users.name,
      username: users.username,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.role, "sales"))
    .orderBy(desc(users.createdAt));
}
