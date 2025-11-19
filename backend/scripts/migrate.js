// backend/scripts/migrate.js
/**
 * Simple migration placeholder
 * Use cases:
 *  - Add default fields
 *  - Transform old schema
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "../config/db.js";
import User from "../models/User.js";

dotenv.config();

const migrate = async () => {
  try {
    await connectDB();

    // Example: ensure all users have isVerified field
    await User.updateMany({ isVerified: { $exists: false } }, { isVerified: false });

    console.log(" Migration completed");
    process.exit();
  } catch (err) {
    console.error(" Migration failed:", err.message);
    process.exit(1);
  }
};

migrate();
