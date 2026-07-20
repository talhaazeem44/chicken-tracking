import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import * as schema from "../lib/db/schema";
import { users } from "../lib/db/schema";

async function main() {
  const username = process.env.ADMIN_USERNAME ?? "admin";
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? "Admin";

  if (!password) {
    throw new Error(
      "Set ADMIN_PASSWORD (and optionally ADMIN_USERNAME, ADMIN_NAME) before running this script."
    );
  }
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Add it to .env.local first.");
  }

  const client = postgres(process.env.DATABASE_URL, { prepare: false, max: 1 });
  const db = drizzle(client, { schema });

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, username));

  if (existing) {
    console.log(`Admin "${username}" already exists, skipping.`);
  } else {
    const passwordHash = await bcrypt.hash(password, 10);
    await db.insert(users).values({
      username,
      name,
      passwordHash,
      role: "admin",
    });
    console.log(`Created admin account "${username}".`);
  }

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
