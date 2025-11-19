// backend/config/db.js
import mongoose from "mongoose";
import env from "./env.js";
import logger from "./logger.js";

const connectDB = async (retryCount = 0) => {
  const maxRetries = 5;
  const retryDelayMs = 2000 * (retryCount + 1);

  try {
    mongoose.set("strictQuery", true);

    await mongoose.connect(env.mongoUri, {
      // ✅ Safe, modern connection options (Mongoose 8+)
      serverSelectionTimeoutMS: 10000, // Wait up to 10s for MongoDB to respond
      socketTimeoutMS: 45000,          // Timeout for inactive connections
      connectTimeoutMS: 10000,         // Timeout for initial connection
      maxPoolSize: 10,                 // Connection pool size
      minPoolSize: 2,                  // Keep at least 2 active connections
      retryWrites: true,               // Recommended for Atlas
      // ❌ Removed keepAlive & keepAliveInitialDelay — not supported in Mongoose 8+
    });

    logger.info(`✅ MongoDB connected: ${mongoose.connection.host}`);

    mongoose.connection.on("disconnected", () =>
      logger.warn("⚠️ MongoDB disconnected")
    );

    mongoose.connection.on("reconnected", () =>
      logger.info("🔄 MongoDB reconnected")
    );

    mongoose.connection.on("error", (err) =>
      logger.error("❌ MongoDB connection error:", err.message)
    );
  } catch (err) {
    logger.error(`❌ MongoDB connect error: ${err.message}`);

    if (retryCount < maxRetries) {
      logger.info(`Retrying MongoDB in ${retryDelayMs}ms...`);
      await new Promise((res) => setTimeout(res, retryDelayMs));
      return connectDB(retryCount + 1);
    } else {
      logger.error("🚫 Exceeded max retries. Exiting.");
      process.exit(1);
    }
  }
};

export default connectDB;
