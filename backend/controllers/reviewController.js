// backend/controllers/reviewController.js
import Review from "../models/Review.js";
import Booking from "../models/Booking.js";
import WorkerProfile from "../models/WorkerProfile.js";
import { sendInApp, sendEmail } from "../utils/notify.js";

// ⭐ Add or Update Review
export const addReview = async (req, res) => {
  try {
    const { workerId } = req.params;
    const { jobId, rating, comment } = req.body;
    const clientId = req.user.id;

    const booking = await Booking.findById(jobId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.client.toString() !== clientId.toString()) {
      return res.status(403).json({ success: false, message: "Not your booking" });
    }

    if (booking.status !== "completed") {
      return res
        .status(400)
        .json({ success: false, message: "Can only review completed jobs" });
    }

    // 🔑 NEW: Payment must be completed before review
    if (booking.paymentStatus !== "paid") {
      return res.status(400).json({
        success: false,
        message: "Please complete payment before adding review",
      });
    }

    // Create or update review
    let review = await Review.findOne({ job: jobId, reviewer: clientId });
    if (review) {
      review.rating = rating;
      review.comment = comment;
      await review.save();
    } else {
      review = await Review.create({
        job: jobId,
        reviewer: clientId,
        worker: workerId,
        rating,
        comment,
      });
      booking.reviewed = true;
      await booking.save();
    }

    // Recompute worker rating & total reviews
    const stats = await Review.aggregate([
      { $match: { worker: booking.worker } },
      {
        $group: {
          _id: "$worker",
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    let updatedWorker = null;
    if (stats.length > 0) {
      updatedWorker = await WorkerProfile.findByIdAndUpdate(
        workerId,
        {
          rating: Number(stats[0].avgRating.toFixed(2)),
          totalReviews: stats[0].count,
        },
        { new: true }
      );
    }

    // 🔔 Notify worker (best-effort)
    try {
      const workerProfile = await WorkerProfile.findById(workerId).populate(
        "user",
        "name email phone"
      );
      const workerUser = workerProfile?.user;
      const clientName = req.user?.name || "A client";

      if (workerUser?._id) {
        await sendInApp({
          recipientId: workerUser._id,
          actorId: clientId,
          type: "new_review",
          title: `New Review from ${clientName}`,
          message: `⭐ ${rating} — ${comment || ""}`,
          data: { bookingId: jobId, reviewId: review._id },
          phone: workerUser?.phone || null,
        });

        if (workerUser.email) {
          sendEmail({
            to: workerUser.email,
            subject: "New review received",
            text: `${clientName} left you a ${rating}★ review. ${comment || ""}`,
          }).catch(() => {});
        }
      }
    } catch (notifErr) {
      console.error("Notify worker error:", notifErr);
    }

    return res.json({
      success: true,
      message: "Review saved",
      data: {
        ...review.toObject(),
        workerRating: updatedWorker?.rating,
        workerTotalReviews: updatedWorker?.totalReviews,
      },
    });
  } catch (err) {
    console.error(" addReview error:", err);
    return res.status(500).json({ success: false, message: "Failed to add review" });
  }
};

// ⭐ Get all reviews for a worker
export const getWorkerReviews = async (req, res) => {
  try {
    const { workerId } = req.params;
    const reviews = await Review.find({ worker: workerId })
      .populate("reviewer", "name email")
      .sort({ createdAt: -1 });

    return res.json({ success: true, data: reviews });
  } catch (err) {
    console.error(" getWorkerReviews error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch reviews" });
  }
};

// ⭐ Get all reviews for a job
export const getJobReviews = async (req, res) => {
  try {
    const { jobId } = req.params;
    const reviews = await Review.find({ job: jobId })
      .populate("reviewer", "name email")
      .sort({ createdAt: -1 });

    return res.json({ success: true, data: reviews });
  } catch (err) {
    console.error(" getJobReviews error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch job reviews" });
  }
};
