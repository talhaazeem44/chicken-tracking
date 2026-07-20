"use server";

import * as z from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/dal";
import { db } from "@/lib/db";
import { sales } from "@/lib/db/schema";
import { getStockSummary } from "@/lib/inventory";

const CreateSaleSchema = z.object({
  shopName: z.string().trim().min(1, { error: "Shop name is required." }),
  buyerName: z.string().trim().min(1, { error: "Buyer name is required." }),
  weightKg: z.coerce
    .number({ error: "Enter the weight sold." })
    .positive({ error: "Weight must be greater than 0." }),
  totalAmount: z.coerce
    .number({ error: "Enter the total bill amount." })
    .positive({ error: "Total bill must be greater than 0." }),
});

export type CreateSaleState = { error?: string } | undefined;

export async function createSale(
  _prevState: CreateSaleState,
  formData: FormData
): Promise<CreateSaleState> {
  const session = await requireRole("sales");

  const validated = CreateSaleSchema.safeParse({
    shopName: formData.get("shopName"),
    buyerName: formData.get("buyerName"),
    weightKg: formData.get("weightKg"),
    totalAmount: formData.get("totalAmount"),
  });

  if (!validated.success) {
    return { error: validated.error.issues[0]?.message ?? "Invalid input." };
  }

  const { shopName, buyerName, weightKg, totalAmount } = validated.data;

  const stock = await getStockSummary(session.userId);
  if (weightKg > stock.balanceKg) {
    return {
      error: `Not enough stock. You only have ${stock.balanceKg.toFixed(2)}kg remaining.`,
    };
  }

  const ratePerKg = totalAmount / weightKg;
  const profit = totalAmount - weightKg * stock.avgCostPerKg;

  const [sale] = await db
    .insert(sales)
    .values({
      salesPersonId: session.userId,
      shopName,
      buyerName,
      weightKg: weightKg.toFixed(2),
      ratePerKg: ratePerKg.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      costPerKgAtSale: stock.avgCostPerKg.toFixed(2),
      profit: profit.toFixed(2),
    })
    .returning({ id: sales.id });

  revalidatePath("/sales");
  revalidatePath("/sales/ledger");
  revalidatePath("/admin/ledger");
  revalidatePath("/admin");

  redirect(`/sales/receipt/${sale.id}`);
}
