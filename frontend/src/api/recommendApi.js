// frontend/src/api/recommendApi.js
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL
    ? `${import.meta.env.VITE_BACKEND_URL}/api/bookings`
    : "https://service-finder-qcj8.onrender.com/api/bookings", // ✅ live backend fallback
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const recommendApi = {
  recommendWorkers: (data) => API.post("/recommend-workers", data),
};
