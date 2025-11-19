import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import cookieParser from "cookie-parser"; // ✅ for reading cookies
import limiter from "./middlewares/rateLimiter.js";
import { notFound, errorHandler } from "./middlewares/errorHandler.js";
import env from "./config/env.js";
import uploadRoutes from "./routes/uploadRoutes.js";

const app = express();

// ✅ Trust proxy (important for cookies behind proxies like Render)
app.set("trust proxy", 1);

// ✅ Core middlewares
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ CORS setup (Frontend whitelist)
app.use(
  cors({
    origin: [
      "http://localhost:5173", // dev
      "https://360services.app", // your deployed frontend ✅
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Helmet (security headers)
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false, // disable CSP for local dev
  })
);

// ✅ Logger + Rate limiter
app.use(morgan("dev"));
app.use(limiter);

// ✅ Static file serving (uploads)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ✅ Health check endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🏡 Home Services API Running Successfully",
    environment: env.nodeEnv,
  });
});

// ✅ Routes
import authRoutes from "./routes/authRoutes.js";
import workerRoutes from "./routes/workerRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

app.use("/api/auth", authRoutes);
app.use("/api/workers", workerRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/upload", uploadRoutes);

// ✅ Debug mode for development only
if (env.nodeEnv !== "production") {
  app.use((req, res, next) => {
    const originalJson = res.json;
    res.json = function (payload) {
      try {
        console.log("\n=== 📦 API Response Debug ===");
        console.log("➡️ Path:", req.path);
        if (payload && typeof payload === "object") {
          console.log("🗝 Keys:", Object.keys(payload).slice(0, 10));
        }
      } catch (err) {
        console.error("Debug wrapper crashed:", err?.stack);
      }
      return originalJson.call(this, payload);
    };
    next();
  });
}

// ✅ Error Handlers (must come last)
app.use(notFound);
app.use(errorHandler);

export default app;
