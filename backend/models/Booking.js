// backend/models/Booking.js
import mongoose from "mongoose";
import WorkerProfile from "./WorkerProfile.js";

const bookingSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkerProfile",
      required: true,
    },
    service: {
      category: { type: String, default: "General" },
      subcategory: { type: String, default: "" },
      skills: { type: [String], default: [] },
    },
    price: {
      type: Number,
      required: true,
    },
    notes: { type: String, default: "" },
    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "arrived",
        "rejected",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    reviewed: {
      type: Boolean,
      default: false,
    },
    // 🚀 Live session data
    liveSession: {
      sessionId: { type: String, default: null },
      active: { type: Boolean, default: false },
      startedAt: Date,
      stoppedAt: Date,
    },
  },
  { timestamps: true }
);

/* ---------------------------------------------
   🧠 Pre-save Hook — Ensure Skills Always Exist
---------------------------------------------- */
bookingSchema.pre("save", async function (next) {
  try {
    // Only auto-fill if skills missing or empty
    if (
      !this.service?.skills ||
      !Array.isArray(this.service.skills) ||
      this.service.skills.length === 0
    ) {
      const worker = await WorkerProfile.findById(this.worker);

      if (worker) {
        let finalSkills = [];

        // ✅ Use valid worker skills if present
        if (Array.isArray(worker.skills) && worker.skills.length > 0) {
          finalSkills = worker.skills.filter(
            (s) => typeof s === "string" && s.trim() && s.toLowerCase() !== "n/a"
          );
        }

        // ✅ Fallback for category = "other"
        if (
          (!finalSkills.length || finalSkills.length === 0) &&
          worker.category?.toLowerCase() === "other"
        ) {
          const fallback =
            worker.subcategory ||
            worker.customCategory ||
            worker.customService ||
            "General Service";
          finalSkills = [fallback.trim()];
        }

        this.service.skills = finalSkills;
        if (!this.service.category) this.service.category = worker.category;
        if (!this.service.subcategory)
          this.service.subcategory = worker.subcategory || "";
      }
    }

    // ✅ Ensure category is always a string
    if (!this.service.category) this.service.category = "General";
    if (!Array.isArray(this.service.skills))
      this.service.skills = [String(this.service.skills || "General Service")];

    next();
  } catch (err) {
    console.error("Booking pre-save hook error:", err);
    next();
  }
});

export default mongoose.model("Booking", bookingSchema);
