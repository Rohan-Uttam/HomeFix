// backend/models/Job.js
import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: false, // set false for backward compatibility
      index: true,
    },

    client: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    worker: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "WorkerProfile", 
      required: true 
    },

    // Job Info
    // You can store a short string for service to simplify admin queries
    service: { type: String, required: true, index: true },
    customService: { type: String, default: "", index: true },
    description: { type: String, required: true, maxlength: 1000 },

    // Status
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
      default: "pending",
    },

    // Scheduling
    scheduledDate: { type: Date, required: true },
    completedAt: Date,

    // Payment
    price: { type: Number, required: true, min: 0 },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
  },
  { timestamps: true }
);

// 🔹 Indexes
jobSchema.index({ client: 1, worker: 1, status: 1, booking: 1 });

const Job = mongoose.model("Job", jobSchema);
export default Job;
