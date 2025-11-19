import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🗨️ Text message (optional if file is attached)
    message: {
      type: String,
      trim: true,
      default: "",
    },

    // 📎 Optional file attachments (image / pdf / doc)
    fileUrl: {
      type: String,
      default: null,
    },
    fileType: {
      type: String,
      enum: ["image", "file", null],
      default: null,
    },

    // ✅ Lifecycle status for double ticks (WhatsApp style)
    status: {
      type: String,
      enum: ["sending", "sent", "delivered", "read", "failed"],
      default: "sent",
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Chat", chatSchema);
