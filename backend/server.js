import http from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

import app from "./app.js";
import connectDB from "./config/db.js";
import logger from "./config/logger.js";
import env from "./config/env.js";
import socketHandler, { setIO } from "./socket.js";

// 🧩 Resolve __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🧩 Connect MongoDB
connectDB()
  .then(() => logger.info("✅ MongoDB connected successfully"))
  .catch((err) => {
    logger.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// 🧩 Create HTTP Server
const server = http.createServer(app);

// 🧩 Initialize Socket.io (Render-safe configuration)
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173", // ✅ Development
      "https://360services.app", // ✅ Production (your frontend)
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  },
  pingTimeout: 120000,
  pingInterval: 30000,
  transports: ["websocket", "polling"],
});

// 🧩 Attach IO globally
setIO(io);
socketHandler(io);

// 🧩 Use Render’s provided PORT (important!)
const PORT = process.env.PORT || env.port || 5000;

// 🧩 Start server
server.listen(PORT, "0.0.0.0", () => {
  const baseUrl =
    env.app?.baseUrl ||
    (env.nodeEnv === "production"
      ? `https://service-finder-qcj8.onrender.com`
      : `http://localhost:${PORT}`);

  logger.info(`🚀 Server running in ${env.nodeEnv || "development"} mode`);
  logger.info(`🌐 Listening on port ${PORT}`);
  logger.info(`🌍 Base URL: ${baseUrl}`);
});

// 🧩 Graceful shutdown handlers
process.on("unhandledRejection", (err) => {
  logger.error("❌ Unhandled Rejection:", err.message);
  server.close(() => process.exit(1));
});

process.on("SIGTERM", () => {
  logger.info("🛑 SIGTERM received, shutting down gracefully...");
  server.close(() => {
    logger.info("💤 Process terminated");
  });
});
