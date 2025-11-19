import express from "express";
import {
  getStats,
  getUsers,
  getClients,
  getWorkers,
  deleteUser,
  toggleBlockUser,
  getJobs,
  deleteJob,
  updateJobStatus,
} from "../controllers/adminController.js";
import { authenticate, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ✅ Admin-only routes
router.use(authenticate, authorize("admin"));

// Stats
router.get("/stats", getStats);

// Users
router.get("/users", getUsers);
router.get("/clients", getClients);
router.get("/workers", getWorkers);
router.delete("/users/:id", deleteUser);
router.patch("/users/:id/block", toggleBlockUser);

// Jobs
router.get("/jobs", getJobs);
router.delete("/jobs/:id", deleteJob);
router.patch("/jobs/:id/status", updateJobStatus);

export default router;
