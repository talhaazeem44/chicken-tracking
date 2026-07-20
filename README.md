# Poultry Chicken — Inventory & Sales Ledger

A two-dashboard system for a chicken supply business:

- **Admin dashboard** (`/admin`) — create sales-person logins, view the full sales ledger with daily/weekly/monthly filters, and see revenue/profit/loss across the whole team.
- **Sales dashboard** (`/sales`) — a sales person logs their received stock (weight + cost/kg), records sales (shop, buyer, weight, total bill), prints a bill, and sees their own stock balance and sales history.

Profit/loss on each sale is calculated automatically as `total bill − (weight sold × your average stock cost per kg)`.

## Tech stack

- Next.js 16 (App Router), React 19, Tailwind v4
- Postgres via [Drizzle ORM](https://orm.drizzle.team)
- Custom cookie-based auth (bcrypt password hashing + signed JWT session, following the [Next.js authentication guide](https://nextjs.org/docs/app/guides/authentication)) — no third-party auth provider

## 1. Set up the database

This project needs a Postgres database. The recommended path is Vercel Marketplace:

1. Install the Vercel CLI: `npm i -g vercel`
2. `vercel login`, then `vercel link` from this directory to connect the project.
3. In the Vercel dashboard, add a Postgres integration (Neon) from the Marketplace to this project.
4. Pull the generated env vars locally: `vercel env pull .env.local` — this should include a `DATABASE_URL` (or `POSTGRES_URL`; rename it to `DATABASE_URL` in `.env.local` if needed).

If you'd rather not use Vercel yet, copy `.env.local.example` to `.env.local` and point `DATABASE_URL` at any Postgres instance (e.g. a free Neon/Supabase project).

Then also set `SESSION_SECRET` in `.env.local` (generate one with `openssl rand -base64 32`).

## 2. Install dependencies & create tables

```bash
npm install
npm run db:generate   # generate SQL migration from lib/db/schema.ts
npm run db:migrate    # apply it to your database
```

## 3. Create the first admin login

```bash
ADMIN_USERNAME=admin ADMIN_PASSWORD=changeme ADMIN_NAME="Admin" npm run db:seed-admin
```

(Or set those three vars in `.env.local` instead of inline.) This is the only account created outside the app — the admin creates all sales-person accounts from the Sales Team page.

## 4. Run it

```bash
npm run dev
```

Visit `http://localhost:3000`, sign in as the admin, and create your first sales-person account from **Sales Team**.

## Other scripts

- `npm run db:studio` — browse the database in Drizzle Studio
- `npm run lint` — lint the project
