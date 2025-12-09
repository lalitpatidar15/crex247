
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
console.log("MONGODB_URI:", MONGODB_URI);
let isConnected = false;

export const connectDB = async () => {
  if (!MONGODB_URI) {
    console.warn("MONGODB_URI is not defined. Skipping MongoDB connection.");
    return;
  }

  if (isConnected || mongoose.connection.readyState >= 1) return;
  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
};
