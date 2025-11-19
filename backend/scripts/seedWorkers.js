// backend/scripts/seedWorkers.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import WorkerProfile from "../models/WorkerProfile.js";
import User from "../models/User.js";
import connectDB from "../config/db.js";

dotenv.config();

const seedWorkers = async () => {
  try {
    await connectDB();

    const users = await User.insertMany([
      { name: "Ramesh Kumar", email: "ramesh@example.com", password: "123456", role: "worker" },
      { name: "Amit Sharma", email: "amit@example.com", password: "123456", role: "worker" },
    ]);

    await WorkerProfile.insertMany([
      {
        user: users[0]._id,
        skills: ["plumber", "pipe repair"],
        hourlyRate: 200,
        experience: 3,
        bio: "Expert plumber with 3 years of experience",
      },
      {
        user: users[1]._id,
        skills: ["electrician", "wiring"],
        hourlyRate: 250,
        experience: 5,
        bio: "Certified electrician for homes and offices",
      },
    ]);

    console.log(" Workers seeded successfully");
    process.exit();
  } catch (err) {
    console.error(" Error seeding workers:", err.message);
    process.exit(1);
  }
};

seedWorkers();
