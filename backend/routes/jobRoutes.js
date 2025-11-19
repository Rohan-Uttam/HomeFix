import express from "express";
import { create, updateStatus, myJobs } from "../controllers/jobController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Create new job (client)
router.post("/", authenticate, create);

// Update job status (worker)
router.put("/:id/status", authenticate, updateStatus);

// Logged-in user jobs
router.get("/mine", authenticate, myJobs);

export default router;
