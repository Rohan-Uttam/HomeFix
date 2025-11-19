// frontend/src/api/notificationApi.js
import api from "./axios.js"; // common axios instance

export const notificationApi = {
  // Get all notifications (latest first)
  getAll: async () => {
    return api.get("/notifications");
  },

  // Mark ek notification read
  markAsRead: async (id) => {
    return api.put(`/notifications/${id}/read`);
  },

  // Mark all read
  markAllRead: async () => {
    return api.put("/notifications/mark-all");
  },
};
