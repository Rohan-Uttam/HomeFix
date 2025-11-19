import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking", // 🔄 Job = Booking system
      required: true,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // client
      required: true,
    },
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkerProfile",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      maxlength: 500,
      trim: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate review per JOB (not per worker)
reviewSchema.index({ job: 1, reviewer: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);
export default Review;
