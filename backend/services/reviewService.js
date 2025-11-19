// backend/services/reviewService.js
import Review from "../models/Review.js";
import WorkerProfile from "../models/WorkerProfile.js";

export const createReview = async ({ jobId, reviewerId, workerId, rating, comment }) => {
  const review = await Review.create({ job: jobId, reviewer: reviewerId, worker: workerId, rating, comment });

  const worker = await WorkerProfile.findById(workerId);
  if (worker) await worker.updateRating(rating);

  return review;
};

export const getWorkerReviews = async (workerId) => {
  return Review.find({ worker: workerId }).populate("reviewer", "name email");
};
