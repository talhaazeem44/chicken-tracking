CREATE TYPE "public"."role" AS ENUM('admin', 'sales');--> statement-breakpoint
CREATE TABLE "inventory_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"sales_person_id" integer NOT NULL,
	"weight_kg" numeric(10, 2) NOT NULL,
	"cost_per_kg" numeric(10, 2) NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sales" (
	"id" serial PRIMARY KEY NOT NULL,
	"sales_person_id" integer NOT NULL,
	"shop_name" text NOT NULL,
	"buyer_name" text NOT NULL,
	"weight_kg" numeric(10, 2) NOT NULL,
	"rate_per_kg" numeric(10, 2) NOT NULL,
	"total_amount" numeric(12, 2) NOT NULL,
	"cost_per_kg_at_sale" numeric(10, 2) NOT NULL,
	"profit" numeric(12, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"name" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" "role" DEFAULT 'sales' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "inventory_entries" ADD CONSTRAINT "inventory_entries_sales_person_id_users_id_fk" FOREIGN KEY ("sales_person_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_sales_person_id_users_id_fk" FOREIGN KEY ("sales_person_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;