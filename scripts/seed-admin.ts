import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { UserModel } from "../lib/db/models";

async function main() {
  const username = process.env.ADMIN_USERNAME ?? "admin";
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? "Admin";

  if (!password) {
    throw new Error(
      "Set ADMIN_PASSWORD (and optionally ADMIN_USERNAME, ADMIN_NAME) before running this script."
    );
  }
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not set. Add it to .env.local first.");
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const existing = await UserModel.findOne({ username }).lean();

  if (existing) {
    console.log(`Admin "${username}" already exists, skipping.`);
  } else {
    const passwordHash = await bcrypt.hash(password, 10);
    await UserModel.create({
      username,
      name,
      passwordHash,
      role: "admin",
    });
    console.log(`Created admin account "${username}".`);
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
