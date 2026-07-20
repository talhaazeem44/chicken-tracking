"use server";

import * as z from "zod";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { createSession, deleteSession } from "@/lib/session";

const LoginSchema = z.object({
  username: z.string().trim().min(1, { error: "Username is required." }),
  password: z.string().min(1, { error: "Password is required." }),
});

export type LoginState =
  | { error?: string }
  | undefined;

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const validated = LoginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { error: "Enter a username and password." };
  }

  const { username, password } = validated.data;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.username, username));

  if (!user) {
    return { error: "Invalid username or password." };
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    return { error: "Invalid username or password." };
  }

  if (!user.active) {
    return { error: "This account has been deactivated. Contact your admin." };
  }

  await createSession({ userId: user.id, role: user.role, name: user.name });

  redirect(user.role === "admin" ? "/admin" : "/sales");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
