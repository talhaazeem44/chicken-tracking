"use server";

import * as z from "zod";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/dal";
import { connectDB } from "@/lib/db";
import { InventoryEntryModel, ItemModel } from "@/lib/db/models";

const AddStockSchema = z.object({
  itemId: z
    .string()
    .refine((v) => mongoose.isValidObjectId(v), { error: "Choose an item." }),
  weightKg: z.coerce
    .number({ error: "Enter the weight received." })
    .positive({ error: "Weight must be greater than 0." }),
  costPerKg: z.coerce
    .number({ error: "Enter the cost per kg." })
    .nonnegative({ error: "Cost cannot be negative." }),
  note: z.string().trim().optional(),
});

export type AddStockState = { error?: string; success?: string } | undefined;

export async function addStock(
  _prevState: AddStockState,
  formData: FormData
): Promise<AddStockState> {
  const session = await requireRole("sales");
  await connectDB();

  const validated = AddStockSchema.safeParse({
    itemId: formData.get("itemId"),
    weightKg: formData.get("weightKg"),
    costPerKg: formData.get("costPerKg"),
    note: formData.get("note") || undefined,
  });

  if (!validated.success) {
    return { error: validated.error.issues[0]?.message ?? "Invalid input." };
  }

  const { itemId, weightKg, costPerKg, note } = validated.data;

  const item = await ItemModel.findOne({ _id: itemId, active: true }).lean();
  if (!item) {
    return { error: "Choose a valid, active item." };
  }

  await InventoryEntryModel.create({
    salesPersonId: session.userId,
    itemId,
    weightKg,
    costPerKg,
    note,
  });

  revalidatePath("/sales");
  revalidatePath("/sales/stock");
  return { success: `Added ${weightKg}kg to your stock.` };
}
