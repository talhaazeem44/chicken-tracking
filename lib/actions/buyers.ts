"use server";

import * as z from "zod";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/dal";
import { connectDB } from "@/lib/db";
import { BuyerModel } from "@/lib/db/models";

const BuyerFormSchema = z.object({
  name: z.string().trim().min(2, { error: "Buyer name must be at least 2 characters." }),
  shopName: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
});

export type CreateBuyerState = { error?: string; success?: string } | undefined;

export async function createBuyer(
  _prevState: CreateBuyerState,
  formData: FormData
): Promise<CreateBuyerState> {
  await requireRole("admin");
  await connectDB();

  const validated = BuyerFormSchema.safeParse({
    name: formData.get("name"),
    shopName: formData.get("shopName") || undefined,
    phone: formData.get("phone") || undefined,
    address: formData.get("address") || undefined,
  });

  if (!validated.success) {
    return { error: validated.error.issues[0]?.message ?? "Invalid input." };
  }

  const { name, shopName, phone, address } = validated.data;

  await BuyerModel.create({
    name,
    shopName: shopName ?? "",
    phone: phone ?? "",
    address: address ?? "",
  });

  revalidatePath("/admin/buyers");
  return { success: `Buyer "${name}" added.` };
}

export type UpdateBuyerState = { error?: string; success?: string } | undefined;

export async function updateBuyer(
  buyerId: string,
  _prevState: UpdateBuyerState,
  formData: FormData
): Promise<UpdateBuyerState> {
  await requireRole("admin");
  await connectDB();

  const validated = BuyerFormSchema.safeParse({
    name: formData.get("name"),
    shopName: formData.get("shopName") || undefined,
    phone: formData.get("phone") || undefined,
    address: formData.get("address") || undefined,
  });

  if (!validated.success) {
    return { error: validated.error.issues[0]?.message ?? "Invalid input." };
  }

  const { name, shopName, phone, address } = validated.data;

  await BuyerModel.findByIdAndUpdate(buyerId, {
    name,
    shopName: shopName ?? "",
    phone: phone ?? "",
    address: address ?? "",
  });

  revalidatePath("/admin/buyers");
  revalidatePath(`/admin/buyers/${buyerId}`);
  return { success: "Buyer updated." };
}

export async function setBuyerActive(buyerId: string, active: boolean) {
  await requireRole("admin");
  await connectDB();

  await BuyerModel.findByIdAndUpdate(buyerId, { active });

  revalidatePath("/admin/buyers");
}
