import axios from "axios";

// ✅ Determine environment base URL
const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  (import.meta.env.DEV
    ? "http://localhost:5000" // local backend (for dev)
    : "https://service-finder-qcj8.onrender.com"); // production backend (Render)

// ✅ Create axios instance with /api prefix (matches backend)
const api = axios.create({
  baseURL: `${API_BASE}/api`,
  withCredentials: true, // allow cookies if needed
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// ✅ Request interceptor (attach JWT token)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor (centralized error logging)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
