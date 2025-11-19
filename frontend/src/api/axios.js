// frontend/src/api/api.js
import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "https://service-finder-qcj8.onrender.com"; // ✅ your live backend

const api = axios.create({
  baseURL: `${API_BASE}/api`, // ✅ includes /api prefix for your routes
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// ✅ Attach Bearer token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
