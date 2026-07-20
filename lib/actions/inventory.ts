"use server";

import * as z from "zod";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/dal";
import { db } from "@/lib/db";
import { inventoryEntries } from "@/lib/db/schema";

const AddStockSchema = z.object({
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

  const validated = AddStockSchema.safeParse({
    weightKg: formData.get("weightKg"),
    costPerKg: formData.get("costPerKg"),
    note: formData.get("note") || undefined,
  });

  if (!validated.success) {
    return { error: validated.error.issues[0]?.message ?? "Invalid input." };
  }

  const { weightKg, costPerKg, note } = validated.data;

  await db.insert(inventoryEntries).values({
    salesPersonId: session.userId,
    weightKg: weightKg.toFixed(2),
    costPerKg: costPerKg.toFixed(2),
    note,
  });

  revalidatePath("/sales");
  revalidatePath("/sales/stock");
  return { success: `Added ${weightKg}kg to your stock.` };
}
