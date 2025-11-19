// backend/config/logger.js
import { createLogger, format, transports } from "winston";
import fs from "fs";
import path from "path";
import env from "./env.js";

const { combine, timestamp, printf, colorize, errors } = format;

// ✅ Ensure log directory exists (safe even in containerized/Render environments)
const logDir = path.resolve(process.cwd(), env.logs.dir || "logs");
try {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
} catch (err) {
  // In Render or read-only file systems, logs can fail to persist — fallback to console
  console.warn("⚠️ Unable to create log directory:", logDir, err.message);
}

// ✅ Define log format
const logFormat = printf(({ timestamp: ts, level, message, stack }) => {
  return `${ts} [${level.toUpperCase()}]: ${stack || message}`;
});

// ✅ Base logger configuration
const logger = createLogger({
  level: env.logs.level || "info",
  format: combine(
    errors({ stack: true }), // capture full error stack
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" })
  ),
  transports: [
    // Save errors and combined logs to disk (only if writable)
    new transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
      maxsize: 5 * 1024 * 1024, // 5MB rotation
      maxFiles: 3,
    }),
    new transports.File({
      filename: path.join(logDir, "combined.log"),
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5,
    }),
  ],
  exitOnError: false, // prevent app from crashing on transport errors
});

// ✅ Add colorful console logs in development or when no writable FS (Render)
if (env.nodeEnv !== "production" || process.env.RENDER === "true") {
  logger.add(
    new transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: "HH:mm:ss" }),
        logFormat
      ),
    })
  );
}

export default logger;
