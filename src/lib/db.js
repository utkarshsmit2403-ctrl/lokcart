import mongoose from "mongoose";

const rawUri = process.env.MONGODB_URI || "mongodb://localhost:27017/lokkart";

// Sanitize any malformed connection string parameters (e.g. trailing quotes or escaped quotes)
const MONGODB_URI = rawUri
  .replace(/\\"/g, "")
  .replace(/"/g, "")
  .replace(/&w=majority/g, "");

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!cached.promise || mongoose.connection.readyState === 0) {
    const opts = {
      serverSelectionTimeoutMS: 15000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log("MongoDB Connected Successfully");
      return mongooseInstance;
    }).catch((err) => {
      console.error("MongoDB Connection Error:", err.message);
      cached.promise = null;
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// Legacy fallback helper for pre-existing json database routes
let inMemoryDb = {
  districts: [],
  sellers: [],
  verifications: [],
  categories: [],
};

export function getDb() {
  return inMemoryDb;
}

export function saveDb(data) {
  inMemoryDb = { ...inMemoryDb, ...data };
  return inMemoryDb;
}
