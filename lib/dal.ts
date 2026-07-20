import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export const verifySession = cache(async () => {
  const session = await getSession();
  if (!session?.userId) {
    redirect("/login");
  }
  return session;
});

export const getCurrentUser = cache(async () => {
  const session = await getSession();
  if (!session?.userId) return null;

  const [user] = await db
    .select({
      id: users.id,
      username: users.username,
      name: users.name,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, session.userId));

  return user ?? null;
});

export async function requireRole(role: "admin" | "sales") {
  const session = await verifySession();
  if (session.role !== role) {
    redirect(session.role === "admin" ? "/admin" : "/sales");
  }
  return session;
}
