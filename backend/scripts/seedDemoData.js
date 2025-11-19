// scripts/seedDemoData.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import WorkerProfile from "../models/WorkerProfile.js";
import Job from "../models/Job.js";

dotenv.config();

const MONGO = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/test";

async function run() {
  await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });

  console.log("Connected to mongo for seeding...");

  // Clean small demo data (CAREFUL: use only for dev)
  // await User.deleteMany({ email: /seed-demo/ });

  // Create admin user
  const adminEmail = "admin.seed-demo@example.com";
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = new User({
      name: "Seed Admin",
      email: adminEmail,
      password: await bcrypt.hash("password123", 10),
      role: "admin",
      isVerified: true,
    });
    await admin.save();
    console.log("Created admin:", adminEmail);
  } else {
    console.log("Admin already exists:", adminEmail);
  }

  // Create client
  const clientEmail = "client.seed-demo@example.com";
  let client = await User.findOne({ email: clientEmail });
  if (!client) {
    client = new User({
      name: "Seed Client",
      email: clientEmail,
      password: await bcrypt.hash("password123", 10),
      role: "client",
      isVerified: true,
    });
    await client.save();
    console.log("Created client:", clientEmail);
  } else console.log("Client exists");

  // Create worker user
  const workerEmail = "worker.seed-demo@example.com";
  let workerUser = await User.findOne({ email: workerEmail });
  if (!workerUser) {
    workerUser = new User({
      name: "Seed Worker",
      email: workerEmail,
      password: await bcrypt.hash("password123", 10),
      role: "worker",
      isVerified: true,
    });
    await workerUser.save();
    console.log("Created worker user:", workerEmail);
  } else console.log("Worker user exists");

  // Create worker profile for workerUser (if you use separate WorkerProfile model)
  let wprofile = await WorkerProfile.findOne({ user: workerUser._id });
  if (!wprofile) {
    wprofile = new WorkerProfile({
      user: workerUser._id,
      skills: ["plumbing", "electrical"],
      hourlyRate: 300,
      rateType: "hourly",
      category: "home-services",
      subcategory: "plumbing",
      experience: 3,
      bio: "Seeded worker for demo",
      location: { type: "Point", coordinates: [77.2, 28.6], address: "Delhi, India" },
    });
    await wprofile.save();
    console.log("Created worker profile");
  } else console.log("Worker profile exists");

  // Create a couple jobs (pending and completed)
  const jobCount = await Job.countDocuments({ "client": client._id });
  if (jobCount === 0) {
    const j1 = new Job({
      client: client._id,
      worker: workerUser._id, // if your schema expects WorkerProfile ID change accordingly
      service: "Plumbing - Fix leak",
      description: "Seed job - fix kitchen leak",
      status: "completed",
      scheduledDate: new Date(),
      completedAt: new Date(),
      price: 1200,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await j1.save();

    const j2 = new Job({
      client: client._id,
      worker: workerUser._id,
      service: "Electric - Light fitting",
      description: "Seed job 2",
      status: "pending",
      scheduledDate: new Date(),
      price: 800,
    });
    await j2.save();

    console.log("Created seed jobs");
  } else {
    console.log("Jobs for seed client already exist");
  }

  console.log("Seed complete. Admin login ->", adminEmail, "/ password: password123");
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
