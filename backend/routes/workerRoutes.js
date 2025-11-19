// routes/workerRoutes.js
import express from "express";
import { authenticate, authorize } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";
import {
  getAllWorkers,
  getNearbyWorkers,
  searchWorkers,
  createProfile,
  updateProfile,
  getMyProfile,
} from "../controllers/workerController.js";
import reviewRoutes from "./reviewRoutes.js";

const router = express.Router();

router.get("/", getAllWorkers);
router.get("/search", searchWorkers);
router.get("/nearby", getNearbyWorkers);

// Fetch logged-in worker profile
router.get("/me", authenticate, authorize("worker", "admin"), getMyProfile);

router.post("/", authenticate, authorize("worker"), createProfile);

// Profile update (with avatar upload)
router.put(
  "/profile",
  authenticate,
  authorize("worker", "admin"),
  upload.single("avatar"),
  updateProfile
);

// Nested Reviews
router.use("/:workerId/reviews", reviewRoutes);

export default router;
