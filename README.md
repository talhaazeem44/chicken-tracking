# Poultry Chicken — Inventory & Sales Ledger

A two-dashboard system for a chicken supply business:

- **Admin dashboard** (`/admin`) — create sales-person logins, manage items (name, description, rate/kg), review and approve/reject pending sales, and view the full sales ledger with daily/weekly/monthly filters and revenue/profit/loss across the whole team.
- **Sales dashboard** (`/sales`) — a sales person logs received stock per item (weight + cost/kg), builds a multi-item bill (search an item, use or override its rate, add it to the bill, repeat), saves & prints a restaurant-style itemized receipt, and tracks their own per-item stock balance and sales history — including pending/rejected status with the admin's rejection reason.

Each bill starts **pending**. It only counts toward ledger revenue/profit once an admin approves it; a rejected bill frees the stock it would have consumed and shows the admin's reason on the sales person's dashboard.

Profit/loss on each line is calculated automatically as `line amount − (weight sold × that item's average stock cost per kg)`.

## Tech stack

- Next.js 16 (App Router), React 19, Tailwind v4
- MongoDB via [Mongoose](https://mongoosejs.com)
- Custom cookie-based auth (bcrypt password hashing + signed JWT session, following the [Next.js authentication guide](https://nextjs.org/docs/app/guides/authentication)) — no third-party auth provider

## 1. Set up the database

This project needs a MongoDB database. The free tier of [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) works well:

1. Create a free cluster on MongoDB Atlas (or run `mongod` locally).
2. Create a database user and allow network access (or use "Allow access from anywhere" for local dev).
3. Copy the connection string and set it as `MONGODB_URI` in `.env.local`, e.g.:
   `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/chicken-tracking?retryWrites=true&w=majority`

Then also set `SESSION_SECRET` in `.env.local` (generate one with `openssl rand -base64 32`).

## 2. Install dependencies

```bash
npm install
```

No migration step is needed — Mongoose creates collections on first write.

## 3. Create the first admin login

```bash
ADMIN_USERNAME=admin ADMIN_PASSWORD=changeme ADMIN_NAME="Admin" npm run db:seed-admin
```

(Or set those three vars in `.env.local` instead of inline.) This is the only account created outside the app — the admin creates all sales-person accounts from the Sales Team page, and all items from the Items page.

## 4. Run it

```bash
npm run dev
```

Visit `http://localhost:3000`, sign in as the admin, add at least one item from **Items**, and create your first sales-person account from **Sales Team**.

## Other scripts

- `npm run lint` — lint the project
