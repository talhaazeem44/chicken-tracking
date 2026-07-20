import {
  pgTable,
  serial,
  text,
  numeric,
  timestamp,
  pgEnum,
  integer,
  boolean,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["admin", "sales"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull().default("sales"),
  // Deactivated accounts can't log in, but their past sales/stock records
  // stay intact and attributed to them in the ledger.
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Stock received by a sales person, at a recorded cost per kg.
export const inventoryEntries = pgTable("inventory_entries", {
  id: serial("id").primaryKey(),
  salesPersonId: integer("sales_person_id")
    .notNull()
    .references(() => users.id),
  weightKg: numeric("weight_kg", { precision: 10, scale: 2 }).notNull(),
  costPerKg: numeric("cost_per_kg", { precision: 10, scale: 2 }).notNull(),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// A single sale/bill recorded by a sales person against their stock.
export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  salesPersonId: integer("sales_person_id")
    .notNull()
    .references(() => users.id),
  shopName: text("shop_name").notNull(),
  buyerName: text("buyer_name").notNull(),
  weightKg: numeric("weight_kg", { precision: 10, scale: 2 }).notNull(),
  ratePerKg: numeric("rate_per_kg", { precision: 10, scale: 2 }).notNull(),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
  // Weighted-average cost per kg at the moment of sale, snapshotted for
  // profit/loss reporting even if later stock arrives at a different cost.
  costPerKgAtSale: numeric("cost_per_kg_at_sale", {
    precision: 10,
    scale: 2,
  }).notNull(),
  profit: numeric("profit", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type InventoryEntry = typeof inventoryEntries.$inferSelect;
export type Sale = typeof sales.$inferSelect;
