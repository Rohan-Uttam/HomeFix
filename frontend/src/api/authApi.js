// frontend/src/api/authApi.js
import api from "./api.js"; // ensure correct import path

export const authApi = {
  register: (data, isMultipart = false) =>
    api.post("/auth/register", data, {
      headers: isMultipart ? { "Content-Type": "multipart/form-data" } : {},
    }),

  login: (data) => api.post("/auth/login", data),

  verifyOtp: (data) => api.post("/auth/verify-otp", data),
};
