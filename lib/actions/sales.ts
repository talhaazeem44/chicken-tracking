"use server";

import * as z from "zod";
import mongoose from "mongoose";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/dal";
import { connectDB } from "@/lib/db";
import { ItemModel, SaleModel } from "@/lib/db/models";
import { getStockSummary } from "@/lib/inventory";

const SaleLineInputSchema = z.object({
  itemId: z
    .string()
    .refine((v) => mongoose.isValidObjectId(v), { error: "Invalid item." }),
  weightKg: z.coerce
    .number({ error: "Enter the weight sold." })
    .positive({ error: "Weight must be greater than 0." }),
  ratePerKg: z.coerce
    .number({ error: "Enter the rate." })
    .nonnegative({ error: "Rate cannot be negative." }),
});

const CreateSaleSchema = z.object({
  shopName: z.string().trim().min(1, { error: "Shop name is required." }),
  buyerName: z.string().trim().min(1, { error: "Buyer name is required." }),
  lines: z
    .array(SaleLineInputSchema)
    .min(1, { error: "Add at least one item to the bill." }),
});

export type CreateSaleState = { error?: string } | undefined;

export async function createSale(
  _prevState: CreateSaleState,
  formData: FormData
): Promise<CreateSaleState> {
  const session = await requireRole("sales");
  await connectDB();

  let parsedLines: unknown;
  try {
    parsedLines = JSON.parse(String(formData.get("lines") ?? "[]"));
  } catch {
    return { error: "Invalid line items." };
  }

  const validated = CreateSaleSchema.safeParse({
    shopName: formData.get("shopName"),
    buyerName: formData.get("buyerName"),
    lines: parsedLines,
  });

  if (!validated.success) {
    return { error: validated.error.issues[0]?.message ?? "Invalid input." };
  }

  const { shopName, buyerName, lines } = validated.data;

  // Multiple lines can reference the same item; check total requested
  // quantity per item against that item's stock balance.
  const quantityByItem = new Map<string, number>();
  for (const line of lines) {
    quantityByItem.set(
      line.itemId,
      (quantityByItem.get(line.itemId) ?? 0) + line.weightKg
    );
  }

  const items = await ItemModel.find({
    _id: { $in: [...quantityByItem.keys()] },
  }).lean<{ _id: unknown; name: string }[]>();
  const itemMap = new Map(items.map((item) => [String(item._id), item]));

  const stockByItem = new Map<string, Awaited<ReturnType<typeof getStockSummary>>>();
  for (const [itemId, qty] of quantityByItem) {
    const item = itemMap.get(itemId);
    if (!item) {
      return { error: "One of the selected items no longer exists." };
    }

    const stock = await getStockSummary(session.userId, itemId);
    stockByItem.set(itemId, stock);

    if (qty > stock.balanceKg) {
      return {
        error: `Not enough stock of "${item.name}". Only ${stock.balanceKg.toFixed(2)}kg remaining.`,
      };
    }
  }

  let totalAmount = 0;
  let totalProfit = 0;
  const builtLines = lines.map((line) => {
    const item = itemMap.get(line.itemId)!;
    const stock = stockByItem.get(line.itemId)!;
    const amount = line.weightKg * line.ratePerKg;
    const profit = amount - line.weightKg * stock.avgCostPerKg;

    totalAmount += amount;
    totalProfit += profit;

    return {
      itemId: line.itemId,
      itemName: item.name,
      weightKg: line.weightKg,
      ratePerKg: line.ratePerKg,
      amount,
      costPerKgAtSale: stock.avgCostPerKg,
      profit,
    };
  });

  const sale = await SaleModel.create({
    salesPersonId: session.userId,
    shopName,
    buyerName,
    lines: builtLines,
    totalAmount,
    totalProfit,
    status: "pending",
  });

  revalidatePath("/sales");
  revalidatePath("/sales/ledger");
  revalidatePath("/admin/ledger");
  revalidatePath("/admin");
  revalidatePath("/admin/approvals");

  redirect(`/sales/receipt/${sale._id.toString()}`);
}
