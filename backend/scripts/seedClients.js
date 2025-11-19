// backend/scripts/seedClients.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import connectDB from "../config/db.js";

dotenv.config();

const seedClients = async () => {
  try {
    await connectDB();

    await User.insertMany([
      { name: "Rahul Verma", email: "rahul@example.com", password: "123456", role: "client" },
      { name: "Sneha Gupta", email: "sneha@example.com", password: "123456", role: "client" },
    ]);

    console.log(" Clients seeded successfully");
    process.exit();
  } catch (err) {
    console.error(" Error seeding clients:", err.message);
    process.exit(1);
  }
};

seedClients();
