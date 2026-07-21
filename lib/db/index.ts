import "server-only";
import mongoose from "mongoose";

// Cached on the global object so hot reload in dev doesn't open a new
// connection on every request.
declare global {
  var _mongooseConn: Promise<typeof mongoose> | undefined;
}

export function connectDB() {
  if (!global._mongooseConn) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error(
        "MONGODB_URI is not set. Add it to .env.local (see README for setup instructions)."
      );
    }
    global._mongooseConn = mongoose.connect(uri);
  }
  return global._mongooseConn;
}
