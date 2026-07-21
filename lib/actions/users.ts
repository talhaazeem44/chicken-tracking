"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/dal";
import { connectDB } from "@/lib/db";
import { UserModel } from "@/lib/db/models";

const CreateSalesUserSchema = z.object({
  name: z.string().trim().min(2, { error: "Name must be at least 2 characters." }),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, { error: "Username must be at least 3 characters." })
    .regex(/^[a-z0-9._-]+$/, {
      error: "Username can only contain letters, numbers, dots, - and _.",
    }),
  password: z
    .string()
    .min(6, { error: "Password must be at least 6 characters." }),
});

export type CreateSalesUserState =
  | { error?: string; success?: string }
  | undefined;

export async function createSalesUser(
  _prevState: CreateSalesUserState,
  formData: FormData
): Promise<CreateSalesUserState> {
  await requireRole("admin");
  await connectDB();

  const validated = CreateSalesUserSchema.safeParse({
    name: formData.get("name"),
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { error: validated.error.issues[0]?.message ?? "Invalid input." };
  }

  const { name, username, password } = validated.data;

  const existing = await UserModel.findOne({ username }).lean();
  if (existing) {
    return { error: "That username is already taken." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await UserModel.create({
    name,
    username,
    passwordHash,
    role: "sales",
  });

  revalidatePath("/admin/users");
  return { success: `Sales account "${username}" created.` };
}

const UpdateSalesUserSchema = z.object({
  name: z.string().trim().min(2, { error: "Name must be at least 2 characters." }),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, { error: "Username must be at least 3 characters." })
    .regex(/^[a-z0-9._-]+$/, {
      error: "Username can only contain letters, numbers, dots, - and _.",
    }),
  password: z
    .string()
    .min(6, { error: "Password must be at least 6 characters." })
    .optional()
    .or(z.literal("")),
});

export type UpdateSalesUserState =
  | { error?: string; success?: string }
  | undefined;

export async function updateSalesUser(
  userId: string,
  _prevState: UpdateSalesUserState,
  formData: FormData
): Promise<UpdateSalesUserState> {
  await requireRole("admin");
  await connectDB();

  const validated = UpdateSalesUserSchema.safeParse({
    name: formData.get("name"),
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { error: validated.error.issues[0]?.message ?? "Invalid input." };
  }

  const { name, username, password } = validated.data;

  const existing = await UserModel.findOne({ username }).lean<{ _id: unknown }>();
  if (existing && String(existing._id) !== userId) {
    return { error: "That username is already taken." };
  }

  await UserModel.findByIdAndUpdate(userId, {
    name,
    username,
    ...(password ? { passwordHash: await bcrypt.hash(password, 10) } : {}),
  });

  revalidatePath("/admin/users");
  return { success: "Account updated." };
}

export async function setSalesUserActive(userId: string, active: boolean) {
  await requireRole("admin");
  await connectDB();

  await UserModel.findByIdAndUpdate(userId, { active });

  revalidatePath("/admin/users");
}
