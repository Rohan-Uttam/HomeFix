import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import { getNotifications, markAsRead, markAllRead } from "../controllers/notificationController.js";

const router = express.Router();

router.use(authenticate);

// GET /api/notifications
router.get("/", getNotifications);

// PUT /api/notifications/:id/read
router.put("/:id/read", markAsRead);

// PUT /api/notifications/mark-all
router.put("/mark-all", markAllRead);

export default router;
