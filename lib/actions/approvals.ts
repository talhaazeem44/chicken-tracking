"use server";

import * as z from "zod";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/dal";
import { connectDB } from "@/lib/db";
import { SaleModel } from "@/lib/db/models";

function revalidateAfterReview() {
  revalidatePath("/admin/approvals");
  revalidatePath("/admin/ledger");
  revalidatePath("/admin");
  revalidatePath("/sales");
  revalidatePath("/sales/ledger");
}

export async function approveSale(saleId: string) {
  const session = await requireRole("admin");
  await connectDB();

  await SaleModel.findOneAndUpdate(
    { _id: saleId, status: "pending" },
    { status: "approved", reviewedAt: new Date(), reviewedBy: session.userId }
  );

  revalidateAfterReview();
}

const RejectSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, { error: "Enter a reason for rejecting this sale." }),
});

export type RejectSaleState = { error?: string; success?: string } | undefined;

export async function rejectSale(
  saleId: string,
  _prevState: RejectSaleState,
  formData: FormData
): Promise<RejectSaleState> {
  const session = await requireRole("admin");
  await connectDB();

  const validated = RejectSchema.safeParse({ reason: formData.get("reason") });
  if (!validated.success) {
    return { error: validated.error.issues[0]?.message ?? "Invalid input." };
  }

  await SaleModel.findOneAndUpdate(
    { _id: saleId, status: "pending" },
    {
      status: "rejected",
      rejectionReason: validated.data.reason,
      reviewedAt: new Date(),
      reviewedBy: session.userId,
    }
  );

  revalidateAfterReview();

  return { success: "Sale rejected." };
}
