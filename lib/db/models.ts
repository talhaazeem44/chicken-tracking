import mongoose, { Schema } from "mongoose";

export type Role = "admin" | "sales";
export type SaleStatus = "pending" | "approved" | "rejected";

const UserSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "sales"],
      required: true,
      default: "sales",
    },
    // Deactivated accounts can't log in, but their past sales/stock records
    // stay intact and attributed to them in the ledger.
    active: { type: Boolean, required: true, default: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// A product line admin defines (e.g. "Whole Chicken"), with a default rate
// sales staff can override per line when billing.
const ItemSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    rate: { type: Number, required: true, default: 0 },
    // Deactivated items drop out of the "add stock" and "new sale" pickers,
    // but past stock/sales stay intact and attributed to them.
    active: { type: Boolean, required: true, default: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// A customer admin defines, so sales staff always bill against a known
// buyer (searched/selected, never freely typed).
const BuyerSchema = new Schema(
  {
    name: { type: String, required: true },
    shopName: { type: String, default: "" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    // Deactivated buyers drop out of the "new sale" picker, but past sales
    // stay intact and attributed to them in their ledger.
    active: { type: Boolean, required: true, default: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Stock received by a sales person for a given item, at a recorded cost per kg.
const InventoryEntrySchema = new Schema(
  {
    salesPersonId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    itemId: { type: Schema.Types.ObjectId, ref: "Item", required: true },
    weightKg: { type: Number, required: true },
    costPerKg: { type: Number, required: true },
    note: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// One line of a bill: an item, the quantity sold, and the rate used (which
// may differ from the item's current default rate).
const SaleLineSchema = new Schema(
  {
    itemId: { type: Schema.Types.ObjectId, ref: "Item", required: true },
    itemName: { type: String, required: true },
    weightKg: { type: Number, required: true },
    ratePerKg: { type: Number, required: true },
    amount: { type: Number, required: true },
    // Weighted-average cost per kg at the moment of sale, snapshotted for
    // profit/loss reporting even if later stock arrives at a different cost.
    costPerKgAtSale: { type: Number, required: true },
    profit: { type: Number, required: true },
  },
  { _id: false }
);

// A bill recorded by a sales person, covering one or more items. Starts
// "pending" until an admin approves or rejects it; only approved bills
// count toward ledger revenue/profit and the buyer's ledger, and rejected
// bills free up the stock they would have consumed.
const SaleSchema = new Schema(
  {
    salesPersonId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    buyerId: { type: Schema.Types.ObjectId, ref: "Buyer", required: true },
    // Snapshotted from the buyer record at sale time, so the bill/ledger
    // still reads correctly even if the buyer's details change later.
    buyerName: { type: String, required: true },
    shopName: { type: String, default: "" },
    lines: { type: [SaleLineSchema], required: true },
    totalAmount: { type: Number, required: true },
    totalProfit: { type: Number, required: true },
    // How much of totalAmount was paid at sale time; the rest is
    // outstanding and tracked on the buyer's ledger.
    amountReceived: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      required: true,
      default: "pending",
    },
    rejectionReason: { type: String },
    reviewedAt: { type: Date },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

function getModel<T>(name: string, schema: Schema): mongoose.Model<T> {
  return (mongoose.models[name] as mongoose.Model<T>) ?? mongoose.model<T>(name, schema);
}

export const UserModel = getModel("User", UserSchema);
export const ItemModel = getModel("Item", ItemSchema);
export const BuyerModel = getModel("Buyer", BuyerSchema);
export const InventoryEntryModel = getModel(
  "InventoryEntry",
  InventoryEntrySchema
);
export const SaleModel = getModel("Sale", SaleSchema);
