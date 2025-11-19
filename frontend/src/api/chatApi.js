import api from "./axios.js";

export const chatApi = {
  getMessages: (bookingId) => api.get(`/chats/${bookingId}`),
  sendMessage: (bookingId, data) => api.post(`/chats/${bookingId}`, data),
};
