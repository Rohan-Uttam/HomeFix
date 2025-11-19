import { io } from "socket.io-client";

let socket = null;

export const initSocket = () => {
  if (!socket) {
    const token = localStorage.getItem("token");

    socket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:5000", {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.warn("⚠️ Socket disconnected:", reason);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err.message);
    });
  }

  return socket;
};

export const getSocket = () => socket;
