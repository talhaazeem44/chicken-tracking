import "server-only";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { InventoryEntryModel, ItemModel, SaleModel } from "@/lib/db/models";

export type StockSummary = {
  totalReceivedKg: number;
  avgCostPerKg: number;
  totalSoldKg: number;
  balanceKg: number;
};

export type ItemStockSummary = StockSummary & {
  itemId: string;
  itemName: string;
  active: boolean;
};

// Weighted-average cost across all stock ever received by this sales
// person for this item, used as the cost basis for profit/loss on new
// sales. Pending and approved sales both consume stock; rejected sales
// don't (so a rejection frees the stock back up).
export async function getStockSummary(
  salesPersonId: string,
  itemId: string
): Promise<StockSummary> {
  await connectDB();
  const spId = new mongoose.Types.ObjectId(salesPersonId);
  const itId = new mongoose.Types.ObjectId(itemId);

  const [receivedRows, soldRows] = await Promise.all([
    InventoryEntryModel.aggregate([
      { $match: { salesPersonId: spId, itemId: itId } },
      {
        $group: {
          _id: null,
          totalWeight: { $sum: "$weightKg" },
          totalCost: { $sum: { $multiply: ["$weightKg", "$costPerKg"] } },
        },
      },
    ]),
    SaleModel.aggregate([
      { $match: { salesPersonId: spId, status: { $ne: "rejected" } } },
      { $unwind: "$lines" },
      { $match: { "lines.itemId": itId } },
      { $group: { _id: null, totalWeight: { $sum: "$lines.weightKg" } } },
    ]),
  ]);

  const totalReceivedKg = receivedRows[0]?.totalWeight ?? 0;
  const totalCost = receivedRows[0]?.totalCost ?? 0;
  const totalSoldKg = soldRows[0]?.totalWeight ?? 0;

  return {
    totalReceivedKg,
    avgCostPerKg: totalReceivedKg > 0 ? totalCost / totalReceivedKg : 0,
    totalSoldKg,
    balanceKg: totalReceivedKg - totalSoldKg,
  };
}

// Per-item stock breakdown for a sales person: every active item, plus any
// deactivated item they still have stock history for (so leftover balance
// on a discontinued item doesn't just disappear).
export async function getStockSummaryByItem(
  salesPersonId: string
): Promise<ItemStockSummary[]> {
  await connectDB();
  const spId = new mongoose.Types.ObjectId(salesPersonId);

  const [allItems, receivedRows, soldRows] = await Promise.all([
    ItemModel.find().sort({ name: 1 }).lean<
      { _id: unknown; name: string; active: boolean }[]
    >(),
    InventoryEntryModel.aggregate([
      { $match: { salesPersonId: spId } },
      {
        $group: {
          _id: "$itemId",
          totalWeight: { $sum: "$weightKg" },
          totalCost: { $sum: { $multiply: ["$weightKg", "$costPerKg"] } },
        },
      },
    ]),
    SaleModel.aggregate([
      { $match: { salesPersonId: spId, status: { $ne: "rejected" } } },
      { $unwind: "$lines" },
      { $group: { _id: "$lines.itemId", totalWeight: { $sum: "$lines.weightKg" } } },
    ]),
  ]);

  const receivedMap = new Map(
    receivedRows.map((r) => [
      String(r._id),
      { totalWeight: r.totalWeight as number, totalCost: r.totalCost as number },
    ])
  );
  const soldMap = new Map(
    soldRows.map((r) => [String(r._id), r.totalWeight as number])
  );

  return allItems
    .filter((item) => item.active || receivedMap.has(String(item._id)))
    .map((item) => {
      const id = String(item._id);
      const received = receivedMap.get(id);
      const totalReceivedKg = received?.totalWeight ?? 0;
      const totalCost = received?.totalCost ?? 0;
      const totalSoldKg = soldMap.get(id) ?? 0;

      return {
        itemId: id,
        itemName: item.name,
        active: item.active,
        totalReceivedKg,
        avgCostPerKg: totalReceivedKg > 0 ? totalCost / totalReceivedKg : 0,
        totalSoldKg,
        balanceKg: totalReceivedKg - totalSoldKg,
      };
    });
}

export type InventoryHistoryEntry = {
  id: string;
  itemId: string;
  itemName: string;
  weightKg: number;
  costPerKg: number;
  note: string | null;
  createdAt: Date;
};

export async function getInventoryHistory(
  salesPersonId: string
): Promise<InventoryHistoryEntry[]> {
  await connectDB();
  const spId = new mongoose.Types.ObjectId(salesPersonId);

  const rows = await InventoryEntryModel.aggregate([
    { $match: { salesPersonId: spId } },
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: "items",
        localField: "itemId",
        foreignField: "_id",
        as: "item",
      },
    },
    { $unwind: "$item" },
    {
      $project: {
        weightKg: 1,
        costPerKg: 1,
        note: 1,
        createdAt: 1,
        itemId: 1,
        itemName: "$item.name",
      },
    },
  ]);

  return rows.map((r) => ({
    id: String(r._id),
    itemId: String(r.itemId),
    itemName: r.itemName,
    weightKg: r.weightKg,
    costPerKg: r.costPerKg,
    note: r.note ?? null,
    createdAt: r.createdAt,
  }));
}
