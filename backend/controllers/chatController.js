import Chat from "../models/Chat.js";
import Booking from "../models/Booking.js";
import { errorResponse, successResponse } from "../utils/responseBuilder.js";

/**
 * 📨 Get all messages for a specific booking
 */
export const getMessages = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const messages = await Chat.find({ booking: bookingId })
      .populate("sender", "name role avatar")
      .populate("receiver", "name role avatar")
      .sort({ createdAt: 1 });

    return successResponse(res, "Messages fetched successfully", messages, 200);
  } catch (err) {
    console.error("❌ getMessages error:", err);
    return errorResponse(res, "Failed to fetch messages", 500, [err.message]);
  }
};

/**
 * 💬 Send a new message (supports text + file)
 */
export const sendMessage = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { receiverId, message, fileUrl, fileType } = req.body;

    // At least message or file required
    if ((!message || !message.trim()) && !fileUrl) {
      return errorResponse(res, "Message or file is required", 400);
    }

    const booking = await Booking.findById(bookingId).populate({
      path: "worker",
      populate: { path: "user", select: "_id name" },
    });

    if (!booking) {
      return errorResponse(res, "Booking not found", 404);
    }

    const senderId = String(req.user?._id || req.user?.id);
    let finalReceiverId = receiverId;

    // Auto-detect receiver if not explicitly passed
    if (!finalReceiverId) {
      if (String(booking.client) === senderId) {
        finalReceiverId =
          booking.worker?.user?._id || booking.worker?.user || booking.worker?._id;
      } else {
        finalReceiverId = booking.client;
      }
    }

    if (!finalReceiverId) {
      return errorResponse(res, "Receiver not found for this booking", 400);
    }

    // Create message (text / file / both)
    const chat = await Chat.create({
      booking: bookingId,
      sender: senderId,
      receiver: finalReceiverId,
      message: message?.trim() || "",
      fileUrl: fileUrl || null,
      fileType: fileType || null,
      status: "sent",
    });

    // Populate for real-time emit
    const populatedChat = await Chat.findById(chat._id)
      .populate("sender", "name role avatar")
      .populate("receiver", "name role avatar");

    // Emit new message in real-time to both users in chat room
    if (global.io) {
      global.io.to(`chat:${bookingId}`).emit("chat:new", populatedChat);
    }

    return successResponse(res, "Message sent successfully", populatedChat, 201);
  } catch (err) {
    console.error("❌ sendMessage error:", err);
    return errorResponse(res, "Failed to send message", 500, [err.message]);
  }
};
