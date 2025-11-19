import express from "express";
import { authenticate, authorize } from "../middlewares/authMiddleware.js";
import { addReview, getWorkerReviews, getJobReviews } from "../controllers/reviewController.js";

const router = express.Router({ mergeParams: true });

// 📌 GET /api/reviews/:workerId → all reviews of a worker
router.get("/:workerId", getWorkerReviews);

// 📌 GET /api/reviews/job/:jobId → all reviews of a specific job 
router.get("/job/:jobId", getJobReviews);

// 📌 POST /api/reviews/:workerId → add review (only client, only completed jobs)
router.post("/:workerId", authenticate, authorize("client"), addReview);

export default router;
