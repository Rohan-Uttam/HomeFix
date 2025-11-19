// frontend/src/api/bookingApi.js
import axios from "axios";

// ✅ Base URL (uses environment variable or Render backend)
const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL
    ? `${import.meta.env.VITE_BACKEND_URL}/api/bookings`
    : "https://service-finder-qcj8.onrender.com/api/bookings", // ✅ fallback to live backend
  withCredentials: true,
});

// 🔑 Token interceptor
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const bookingApi = {
  // ⭐ Create booking
  createBooking: (data) => API.post("/", data),

  // ⭐ Client bookings
  getClientBookings: () => API.get("/client"),

  // ⭐ Worker bookings
  getWorkerBookings: () => API.get("/worker"),

  // ⭐ Update booking status
  updateStatus: (id, status) => API.put(`/${id}/status`, { status }),

  // ⭐ Update payment status
  updatePaymentStatus: (id, status) => API.put(`/${id}/payment`, { status }),

  // ⭐ Start live session (Worker only)
  startLive: (id) => API.put(`/${id}/start-live`),

  // ⭐ Stop live session (Worker only)
  stopLive: (id) => API.put(`/${id}/stop-live`),
};

export default bookingApi;
