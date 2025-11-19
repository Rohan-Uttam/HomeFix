// frontend/src/api/paymentApi.js
import api from "./axios.js";

// Payment APIs (Razorpay flow)
export const paymentApi = {
  createOrder: (data) => api.post("/payments/order", data),  // 🔥 fixed endpoint
  verify: (data) => api.post("/payments/verify", data),
};
