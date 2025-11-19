import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Loader2, CheckCircle } from "lucide-react";
import { notificationApi } from "../api/notificationApi.js";
import { useAppContext } from "../context/AppContext.jsx";
import toast from "react-hot-toast";

export default function NotificationDropdown({ socket }) {
  const { user } = useAppContext();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);

  // ✅ Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await notificationApi.getAll();
      const list = res.data?.data || [];
      setNotifications(list);
      setUnread(list.filter((n) => !n.read).length);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      toast.error("Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // ✅ Live socket updates
  useEffect(() => {
    if (!socket) return;
    socket.on("notification:new", (notif) => {
      setNotifications((prev) => [notif, ...prev]);
      setUnread((u) => u + 1);
      toast.success("🔔 New notification received!");
    });
    return () => socket.off("notification:new");
  }, [socket]);

  // ✅ Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // ✅ Mark as read
  const handleMarkAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnread((u) => Math.max(0, u - 1));
    } catch (err) {
      console.error("Mark as read failed:", err);
      toast.error("Failed to mark notification");
    }
  };

  // ✅ Mark all as read
  const handleMarkAll = async () => {
    try {
      await notificationApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnread(0);
      toast.success("All notifications marked as read");
    } catch (err) {
      console.error("Mark all read failed:", err);
      toast.error("Failed to mark all read");
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full hover:bg-sky-50 transition-colors focus:ring-2 focus:ring-sky-200 focus:outline-none"
      >
        <Bell
          className={`w-6 h-6 transition-all ${
            open ? "text-sky-600" : "text-gray-600 hover:text-sky-600"
          }`}
        />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[11px] w-5 h-5 rounded-full flex items-center justify-center font-semibold shadow">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex justify-between items-center px-4 py-3 border-b bg-gray-50">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-800">🔔 Notifications</span>
                <span className="text-xs text-gray-500">({unread} unread)</span>
              </div>
              {unread > 0 && (
                <button
                  onClick={handleMarkAll}
                  className="text-xs text-sky-600 hover:underline font-medium"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {loading ? (
                <div className="flex items-center justify-center py-8 text-gray-500">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  <span className="text-sm">Loading...</span>
                </div>
              ) : notifications.length === 0 ? (
                <p className="p-6 text-sm text-gray-500 text-center">No notifications yet</p>
              ) : (
                notifications.map((n) => (
                  <motion.div
                    key={n._id}
                    onClick={() => handleMarkAsRead(n._id)}
                    whileTap={{ scale: 0.97 }}
                    className={`px-4 py-3 border-b last:border-0 cursor-pointer transition-all ${
                      n.read
                        ? "bg-white hover:bg-gray-50"
                        : "bg-gradient-to-r from-sky-50 to-indigo-50 hover:from-sky-100 hover:to-indigo-100"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <p
                        className={`font-semibold text-sm ${
                          n.read ? "text-gray-800" : "text-sky-700"
                        }`}
                      >
                        {n.title}
                      </p>
                      {!n.read && (
                        <span className="text-[10px] text-sky-500 font-semibold">NEW</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5">{n.message}</p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {!loading && notifications.length > 0 && (
              <div className="flex justify-between items-center px-4 py-2 bg-gray-50 border-t text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                  <span>
                    {unread === 0
                      ? "All caught up!"
                      : `${unread} unread notification${unread > 1 ? "s" : ""}`}
                  </span>
                </div>
                <button
                  onClick={fetchNotifications}
                  className="text-sky-600 font-medium hover:underline"
                >
                  Refresh
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
