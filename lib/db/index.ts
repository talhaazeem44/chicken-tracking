import "server-only";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Lazily created so importing this module doesn't fail at build time in
// environments where DATABASE_URL isn't available yet (e.g. static analysis
// during `next build`). The connection is only opened on first query.
let _db: PostgresJsDatabase<typeof schema> | undefined;

function getDb() {
  if (!_db) {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL is not set. Add it to .env.local (see README for setup instructions)."
      );
    }
    const client = postgres(process.env.DATABASE_URL, { prepare: false });
    _db = drizzle(client, { schema });
  }
  return _db;
}

export const db: PostgresJsDatabase<typeof schema> = new Proxy(
  {} as PostgresJsDatabase<typeof schema>,
  {
    get(_target, prop, receiver) {
      return Reflect.get(getDb(), prop, receiver);
    },
  }
);
