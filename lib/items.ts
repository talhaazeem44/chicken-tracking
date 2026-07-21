import "server-only";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { ItemModel } from "@/lib/db/models";

export type ItemRecord = {
  id: string;
  name: string;
  description: string;
  rate: number;
  active: boolean;
  createdAt: Date;
};

type ItemDoc = {
  _id: unknown;
  name: string;
  description?: string;
  rate: number;
  active: boolean;
  createdAt: Date;
};

function toItem(doc: ItemDoc): ItemRecord {
  return {
    id: String(doc._id),
    name: doc.name,
    description: doc.description ?? "",
    rate: doc.rate,
    active: doc.active,
    createdAt: doc.createdAt,
  };
}

export async function getItems(): Promise<ItemRecord[]> {
  await connectDB();
  const docs = await ItemModel.find().sort({ createdAt: -1 }).lean<ItemDoc[]>();
  return docs.map(toItem);
}

export async function getActiveItems(): Promise<ItemRecord[]> {
  await connectDB();
  const docs = await ItemModel.find({ active: true })
    .sort({ name: 1 })
    .lean<ItemDoc[]>();
  return docs.map(toItem);
}

export async function getItemById(id: string): Promise<ItemRecord | null> {
  await connectDB();
  if (!mongoose.isValidObjectId(id)) return null;
  const doc = await ItemModel.findById(id).lean<ItemDoc | null>();
  return doc ? toItem(doc) : null;
}
