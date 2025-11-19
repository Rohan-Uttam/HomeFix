import express from "express";
import { authenticate, authorize } from "../middlewares/authMiddleware.js";
import {
  createBooking,
  getClientBookings,
  getWorkerBookings,
  updateBookingStatus,
  updatePaymentStatus,
  startLiveSession,
  stopLiveSession,
  recommendWorkersController,
} from "../controllers/bookingController.js";

const router = express.Router();

router.post("/", authenticate, authorize("client"), createBooking);
router.get("/client", authenticate, authorize("client"), getClientBookings);
router.get("/worker", authenticate, authorize("worker"), getWorkerBookings);
router.put("/:id/status", authenticate, authorize("worker"), updateBookingStatus);
router.put("/:id/payment", authenticate, authorize("client"), updatePaymentStatus);

// Recommendation
router.post("/recommend-workers", authenticate, authorize("client"), recommendWorkersController);

// Live tracking routes (worker-only)
router.put("/:id/start-live", authenticate, authorize("worker"), startLiveSession);
router.put("/:id/stop-live", authenticate, authorize("worker"), stopLiveSession);

export default router;
