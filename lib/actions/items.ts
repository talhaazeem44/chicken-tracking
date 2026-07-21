"use server";

import * as z from "zod";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/dal";
import { connectDB } from "@/lib/db";
import { ItemModel } from "@/lib/db/models";

const ItemFormSchema = z.object({
  name: z.string().trim().min(2, { error: "Item name must be at least 2 characters." }),
  description: z.string().trim().optional(),
  rate: z.coerce
    .number({ error: "Enter the rate." })
    .nonnegative({ error: "Rate cannot be negative." }),
});

export type CreateItemState = { error?: string; success?: string } | undefined;

export async function createItem(
  _prevState: CreateItemState,
  formData: FormData
): Promise<CreateItemState> {
  await requireRole("admin");
  await connectDB();

  const validated = ItemFormSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    rate: formData.get("rate"),
  });

  if (!validated.success) {
    return { error: validated.error.issues[0]?.message ?? "Invalid input." };
  }

  const { name, description, rate } = validated.data;

  const existing = await ItemModel.findOne({ name }).lean();
  if (existing) {
    return { error: "An item with that name already exists." };
  }

  await ItemModel.create({ name, description: description ?? "", rate });

  revalidatePath("/admin/items");
  return { success: `Item "${name}" added.` };
}

export type UpdateItemState = { error?: string; success?: string } | undefined;

export async function updateItem(
  itemId: string,
  _prevState: UpdateItemState,
  formData: FormData
): Promise<UpdateItemState> {
  await requireRole("admin");
  await connectDB();

  const validated = ItemFormSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    rate: formData.get("rate"),
  });

  if (!validated.success) {
    return { error: validated.error.issues[0]?.message ?? "Invalid input." };
  }

  const { name, description, rate } = validated.data;

  const existing = await ItemModel.findOne({ name }).lean<{ _id: unknown }>();
  if (existing && String(existing._id) !== itemId) {
    return { error: "An item with that name already exists." };
  }

  await ItemModel.findByIdAndUpdate(itemId, {
    name,
    description: description ?? "",
    rate,
  });

  revalidatePath("/admin/items");
  return { success: "Item updated." };
}

export async function setItemActive(itemId: string, active: boolean) {
  await requireRole("admin");
  await connectDB();

  await ItemModel.findByIdAndUpdate(itemId, { active });

  revalidatePath("/admin/items");
}
