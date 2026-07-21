import "server-only";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { BuyerModel } from "@/lib/db/models";

export type BuyerRecord = {
  id: string;
  name: string;
  shopName: string;
  phone: string;
  address: string;
  active: boolean;
  createdAt: Date;
};

type BuyerDoc = {
  _id: unknown;
  name: string;
  shopName?: string;
  phone?: string;
  address?: string;
  active: boolean;
  createdAt: Date;
};

function toBuyer(doc: BuyerDoc): BuyerRecord {
  return {
    id: String(doc._id),
    name: doc.name,
    shopName: doc.shopName ?? "",
    phone: doc.phone ?? "",
    address: doc.address ?? "",
    active: doc.active,
    createdAt: doc.createdAt,
  };
}

export async function getBuyers(): Promise<BuyerRecord[]> {
  await connectDB();
  const docs = await BuyerModel.find().sort({ createdAt: -1 }).lean<BuyerDoc[]>();
  return docs.map(toBuyer);
}

export async function getActiveBuyers(): Promise<BuyerRecord[]> {
  await connectDB();
  const docs = await BuyerModel.find({ active: true })
    .sort({ name: 1 })
    .lean<BuyerDoc[]>();
  return docs.map(toBuyer);
}

export async function getBuyerById(id: string): Promise<BuyerRecord | null> {
  await connectDB();
  if (!mongoose.isValidObjectId(id)) return null;
  const doc = await BuyerModel.findById(id).lean<BuyerDoc | null>();
  return doc ? toBuyer(doc) : null;
}
