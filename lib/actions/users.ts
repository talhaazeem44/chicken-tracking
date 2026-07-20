"use server";

import * as z from "zod";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/dal";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

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

  const validated = CreateSalesUserSchema.safeParse({
    name: formData.get("name"),
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { error: validated.error.issues[0]?.message ?? "Invalid input." };
  }

  const { name, username, password } = validated.data;

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, username));

  if (existing) {
    return { error: "That username is already taken." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await db.insert(users).values({
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
  userId: number,
  _prevState: UpdateSalesUserState,
  formData: FormData
): Promise<UpdateSalesUserState> {
  await requireRole("admin");

  const validated = UpdateSalesUserSchema.safeParse({
    name: formData.get("name"),
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { error: validated.error.issues[0]?.message ?? "Invalid input." };
  }

  const { name, username, password } = validated.data;

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, username));

  if (existing && existing.id !== userId) {
    return { error: "That username is already taken." };
  }

  await db
    .update(users)
    .set({
      name,
      username,
      ...(password ? { passwordHash: await bcrypt.hash(password, 10) } : {}),
    })
    .where(eq(users.id, userId));

  revalidatePath("/admin/users");
  return { success: "Account updated." };
}

export async function setSalesUserActive(userId: number, active: boolean) {
  await requireRole("admin");

  await db
    .update(users)
    .set({ active })
    .where(eq(users.id, userId));

  revalidatePath("/admin/users");
}
