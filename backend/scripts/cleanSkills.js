import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import WorkerProfile from "../models/WorkerProfile.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/test";

const cleanSkillsArray = (skills) => {
  if (!skills) return [];
  if (Array.isArray(skills)) {
    return skills
      .map((s) => (typeof s === "string" ? s.trim() : String(s)))
      .filter((s) => s && s !== "N/A" && s !== '[""]' && s !== '["N/A"]');
  }
  if (typeof skills === "string") {
    try {
      const parsed = JSON.parse(skills.replace(/'/g, '"'));
      return Array.isArray(parsed)
        ? parsed.filter((s) => s && s.trim() !== "" && s !== "N/A")
        : [];
    } catch {
      return [];
    }
  }
  return [];
};

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // 🧹 Clean Worker Profiles
    const workers = await WorkerProfile.find();
    let workerCount = 0;

    for (const w of workers) {
      const cleaned = cleanSkillsArray(w.skills);
      if (JSON.stringify(cleaned) !== JSON.stringify(w.skills)) {
        w.skills = cleaned;
        await w.save();
        workerCount++;
      }
    }
    console.log(`🧩 Cleaned ${workerCount} worker profiles`);

    // 🧹 Clean Bookings
    const bookings = await Booking.find();
    let bookingCount = 0;

    for (const b of bookings) {
      const cleaned = cleanSkillsArray(b.service?.skills || []);
      if (JSON.stringify(cleaned) !== JSON.stringify(b.service?.skills || [])) {
        b.service.skills = cleaned;
        await b.save();
        bookingCount++;
      }
    }
    console.log(`📦 Cleaned ${bookingCount} bookings`);

    console.log("✨ Cleanup complete!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Cleanup failed:", err);
    process.exit(1);
  }
})();
