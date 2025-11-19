// backend/models/WorkerProfile.js
import mongoose from "mongoose";

const workerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // 🧩 Skills & Rates
    skills: { type: [String], default: [], index: true },
    hourlyRate: { type: Number, required: true, min: 0, default: 0 },
    rateType: {
      type: String,
      enum: ["hourly", "daily", "monthly"],
      default: "hourly",
    },

    // 🏷️ Categories
    category: { type: String, index: true },
    subcategory: { type: String, index: true },
    customCategory: { type: String, default: "", index: true },

    // 📈 Experience & Bio
    experience: { type: Number, default: 0 },
    bio: { type: String, maxlength: 1000 },

    // ⏰ Availability
    availability: {
      type: String,
      enum: ["full-time", "part-time", "weekends", "flexible"],
      default: "flexible",
    },

    // 📍 Location (GeoJSON)
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
        required: true,
      },
      address: { type: String, default: "Not Provided" },
    },

    // 🖼️ Profile Image & Rating
    profileImage: { type: String, default: null },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },

    // 🛰️ Live location (optional)
    currentLocation: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] },
    },
    isSharingLocation: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// 🌍 Geo indexes
workerProfileSchema.index({ location: "2dsphere" });
workerProfileSchema.index({ currentLocation: "2dsphere" });

/* ---------------------------------------------
   🔧 Pre-save Hook — Normalize & Clean Data
---------------------------------------------- */
workerProfileSchema.pre("save", function (next) {
  // 🧠 Normalize skills (trim, filter empties, remove duplicates)
  if (Array.isArray(this.skills)) {
    this.skills = this.skills
      .map((s) => (typeof s === "string" ? s.trim() : String(s)))
      .filter((s) => s && s.toLowerCase() !== "n/a");

    const seen = new Set();
    this.skills = this.skills.filter((s) => {
      const key = s.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // 🧩 Normalize subcategory (convert comma-separated into spaced string)
  if (typeof this.subcategory === "string" && this.subcategory.length > 0) {
    this.subcategory = this.subcategory
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean)
      .join(", ");
  }

  // 🧹 Remove skills that duplicate subcategory or customCategory
  const subParts =
    (this.subcategory || "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean) || [];
  const customLower = (this.customCategory || "").toLowerCase();

  if (this.skills && this.skills.length) {
    this.skills = this.skills.filter((s) => {
      const lower = String(s).toLowerCase();
      return !subParts.includes(lower) && lower !== customLower;
    });
  }

  // 📍 Ensure valid location coordinates
  if (this.location) {
    const [lng = 0, lat = 0] = this.location.coordinates || [0, 0];
    this.location.coordinates = [Number(lng), Number(lat)];
    this.location.address ||= "Not Provided";
    this.location.type = "Point";
  }

  // 🛰️ Ensure valid currentLocation coordinates
  if (this.currentLocation) {
    const [lng = 0, lat = 0] = this.currentLocation.coordinates || [0, 0];
    this.currentLocation.coordinates = [Number(lng), Number(lat)];
    this.currentLocation.type = "Point";
  }

  next();
});

/* ---------------------------------------------
   🧠 Post-Validate Hook — Auto-Fill Skills for “other” Category
---------------------------------------------- */
workerProfileSchema.post("validate", function (doc, next) {
  if (
    (!doc.skills || doc.skills.length === 0) &&
    doc.category?.toLowerCase() === "other"
  ) {
    const fallback =
      doc.subcategory ||
      doc.customCategory ||
      doc.bio?.split(" ").slice(0, 3).join(" ") ||
      "General Service";

    doc.skills = [fallback.trim()];
  }
  next();
});

const WorkerProfile = mongoose.model("WorkerProfile", workerProfileSchema);
export default WorkerProfile;
