import Notification from "../models/Notification.js";

// 📥 Get notifications (latest first, unread first)
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .populate("actor", "name email")
      .sort({ read: 1, createdAt: -1 })
      .limit(50);

    res.json({ success: true, data: notifications });
  } catch (err) {
    console.error("getNotifications error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch notifications" });
  }
};

//  Mark single notification as read
export const markAsRead = async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { read: true },
      { new: true }
    );
    if (!notif) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }
    res.json({ success: true, data: notif });
  } catch (err) {
    console.error("markAsRead error:", err);
    res.status(500).json({ success: false, message: "Failed to update notification" });
  }
};

//  Mark all as read
export const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, read: false },
      { $set: { read: true } }
    );
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (err) {
    console.error("markAllRead error:", err);
    res.status(500).json({ success: false, message: "Failed to update notifications" });
  }
};
