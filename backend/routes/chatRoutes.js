import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import { getMessages, sendMessage } from "../controllers/chatController.js";

const router = express.Router();

// 🔹 Fetch all messages for a booking
router.get("/:bookingId", authenticate, getMessages);

// 🔹 Send new message (text / file)
router.post("/:bookingId", authenticate, sendMessage);

export default router;
