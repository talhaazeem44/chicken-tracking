import "server-only";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { UserModel, SaleModel } from "@/lib/db/models";
import type { SaleStatus } from "@/lib/db/models";

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

type SaleLineDoc = {
  itemId: unknown;
  itemName: string;
  weightKg: number;
  ratePerKg: number;
  amount: number;
  costPerKgAtSale: number;
  profit: number;
};

type SaleDoc = {
  _id: unknown;
  salesPersonId: { _id: unknown; name: string } | unknown;
  shopName: string;
  buyerName: string;
  lines: SaleLineDoc[];
  totalAmount: number;
  totalProfit: number;
  status: SaleStatus;
  rejectionReason?: string;
  createdAt: Date;
};

// One row per bill (not per line): a bill can cover several items, so
// weight/rate/cost are aggregated across its lines for ledger display.
export type LedgerRow = {
  id: string;
  itemsSummary: string;
  shopName: string;
  buyerName: string;
  weightKg: number;
  ratePerKg: number;
  totalAmount: number;
  costPerKgAtSale: number;
  profit: number;
  createdAt: Date;
  salesPersonName: string;
  status: SaleStatus;
  rejectionReason?: string;
};

function salesPersonName(doc: SaleDoc): string {
  const person = doc.salesPersonId as { name?: string } | null;
  return person?.name ?? "Unknown";
}

function toLedgerRow(doc: SaleDoc): LedgerRow {
  const weightKg = doc.lines.reduce((sum, line) => sum + line.weightKg, 0);
  const itemsSummary = doc.lines
    .map((line) => `${line.itemName} (${line.weightKg}kg)`)
    .join(", ");
  const costWeighted = doc.lines.reduce(
    (sum, line) => sum + line.costPerKgAtSale * line.weightKg,
    0
  );

  return {
    id: String(doc._id),
    itemsSummary,
    shopName: doc.shopName,
    buyerName: doc.buyerName,
    weightKg,
    ratePerKg: weightKg > 0 ? doc.totalAmount / weightKg : 0,
    totalAmount: doc.totalAmount,
    costPerKgAtSale: weightKg > 0 ? costWeighted / weightKg : 0,
    profit: doc.totalProfit,
    createdAt: doc.createdAt,
    salesPersonName: salesPersonName(doc),
    status: doc.status,
    rejectionReason: doc.rejectionReason,
  };
}

export async function getLedger({
  period = "all",
  salesPersonId,
  status = "approved",
}: {
  period?: LedgerPeriod;
  salesPersonId?: string;
  status?: SaleStatus | "all";
}): Promise<LedgerRow[]> {
  await connectDB();

  const match: Record<string, unknown> = {};
  const start = periodStartDate(period);
  if (start) match.createdAt = { $gte: start };
  if (salesPersonId) {
    match.salesPersonId = new mongoose.Types.ObjectId(salesPersonId);
  }
  if (status !== "all") match.status = status;

  const docs = await SaleModel.find(match)
    .sort({ createdAt: -1 })
    .populate("salesPersonId", "name")
    .lean<SaleDoc[]>();

  return docs.map(toLedgerRow);
}

export function summarizeLedger(rows: LedgerRow[]) {
  return rows.reduce(
    (acc, row) => {
      acc.totalWeightKg += row.weightKg;
      acc.totalAmount += row.totalAmount;
      acc.totalProfit += row.profit;
      acc.count += 1;
      return acc;
    },
    { totalWeightKg: 0, totalAmount: 0, totalProfit: 0, count: 0 }
  );
}

// Full itemized bill, used by the printable receipt and the admin
// approvals queue.
export type SaleDetail = {
  id: string;
  shopName: string;
  buyerName: string;
  lines: {
    itemName: string;
    weightKg: number;
    ratePerKg: number;
    amount: number;
  }[];
  totalAmount: number;
  totalProfit: number;
  createdAt: Date;
  salesPersonName: string;
  salesPersonId: string;
  status: SaleStatus;
  rejectionReason?: string;
};

function toSaleDetail(doc: SaleDoc): SaleDetail {
  const person = doc.salesPersonId as { _id?: unknown; name?: string } | null;
  return {
    id: String(doc._id),
    shopName: doc.shopName,
    buyerName: doc.buyerName,
    lines: doc.lines.map((line) => ({
      itemName: line.itemName,
      weightKg: line.weightKg,
      ratePerKg: line.ratePerKg,
      amount: line.amount,
    })),
    totalAmount: doc.totalAmount,
    totalProfit: doc.totalProfit,
    createdAt: doc.createdAt,
    salesPersonName: person?.name ?? "Unknown",
    salesPersonId: person?._id ? String(person._id) : "",
    status: doc.status,
    rejectionReason: doc.rejectionReason,
  };
}

export async function getSaleById(id: string): Promise<SaleDetail | null> {
  await connectDB();
  if (!mongoose.isValidObjectId(id)) return null;

  const doc = await SaleModel.findById(id)
    .populate("salesPersonId", "name")
    .lean<SaleDoc | null>();

  return doc ? toSaleDetail(doc) : null;
}

export async function getPendingSales(): Promise<SaleDetail[]> {
  await connectDB();

  const docs = await SaleModel.find({ status: "pending" })
    .sort({ createdAt: 1 })
    .populate("salesPersonId", "name")
    .lean<SaleDoc[]>();

  return docs.map(toSaleDetail);
}

export type SalesTeamMember = {
  id: string;
  name: string;
  username: string;
  active: boolean;
  createdAt: Date;
};

export async function getSalesTeam(): Promise<SalesTeamMember[]> {
  await connectDB();

  const docs = await UserModel.find({ role: "sales" })
    .sort({ createdAt: -1 })
    .lean<
      { _id: unknown; name: string; username: string; active: boolean; createdAt: Date }[]
    >();

  return docs.map((u) => ({
    id: String(u._id),
    name: u.name,
    username: u.username,
    active: u.active,
    createdAt: u.createdAt,
  }));
}

export async function getSalesUserById(id: string) {
  await connectDB();
  if (!mongoose.isValidObjectId(id)) return null;

  const user = await UserModel.findOne({ _id: id, role: "sales" }).lean<{
    _id: unknown;
    name: string;
    username: string;
    active: boolean;
  } | null>();

  if (!user) return null;

  return {
    id: String(user._id),
    name: user.name,
    username: user.username,
    active: user.active,
  };
}
