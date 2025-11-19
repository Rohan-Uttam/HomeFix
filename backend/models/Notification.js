import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      // recipient (User)
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    actor: {
      // who triggered (User) - optional
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    type: {
      type: String,
      enum: [
        "booking_request",
        "booking_update",
        "new_review",
        "payment_success",
        "payment_update", // ✅ added here
        "general",
      ],
      default: "general",
    },

    title: { type: String, required: true },
    message: { type: String, default: "" },
    data: { type: mongoose.Schema.Types.Mixed }, // extra payload (bookingId, url, etc.)
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
