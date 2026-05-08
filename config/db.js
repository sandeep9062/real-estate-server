import mongoose from "mongoose";

let isConnected = false; // Track the connection status

const connectDB = async () => {
  // If already connected, reuse existing connection (Singleton pattern)
  if (isConnected) {
    console.log("✅ Using existing MongoDB connection");
    return;
  }

  // If a connection is already established but we haven't tracked it yet
  if (mongoose.connections[0]?.readyState === 1) {
    isConnected = true;
    console.log("✅ Using existing MongoDB connection (already connected)");
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_DB, {
      dbName: "PropertyBulbul",
    });
    isConnected = db.connections[0].readyState === 1;
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    isConnected = false;
    console.error("❌ MongoDB Failed to Connect:", error.message);
    process.exit(1);
  }
};

export default connectDB;
