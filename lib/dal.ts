import "server-only";
import mongoose from "mongoose";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { connectDB } from "@/lib/db";
import { UserModel } from "@/lib/db/models";

export const verifySession = cache(async () => {
  const session = await getSession();
  // A session predating this app's move to MongoDB (or one whose account
  // was since deleted) carries a userId that isn't a valid ObjectId. Send
  // them back to log in instead of crashing every query that touches it;
  // logging in overwrites the stale cookie with a fresh one.
  if (!session?.userId || !mongoose.isValidObjectId(session.userId)) {
    redirect("/login");
  }
  return session;
});

export const getCurrentUser = cache(async () => {
  const session = await getSession();
  if (!session?.userId || !mongoose.isValidObjectId(session.userId)) return null;

  await connectDB();
  const user = await UserModel.findById(session.userId).lean<{
    _id: unknown;
    username: string;
    name: string;
    role: "admin" | "sales";
    createdAt: Date;
  }>();
  if (!user) return null;

  return {
    id: String(user._id),
    username: user.username,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
  };
});

export async function requireRole(role: "admin" | "sales") {
  const session = await verifySession();
  if (session.role !== role) {
    redirect(session.role === "admin" ? "/admin" : "/sales");
  }
  return session;
}
