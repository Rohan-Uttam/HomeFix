// backend/config/env.js
import dotenv from "dotenv";
import path from "path";

// ✅ Load .env file
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// ✅ Helper for safer fallback
const getEnv = (key, fallback) =>
  process.env[key] !== undefined && process.env[key] !== ""
    ? process.env[key]
    : fallback;

// ✅ Export all env variables in one structured object
export const env = {
  nodeEnv: getEnv("NODE_ENV", "development"),
  port: Number(getEnv("PORT", 5000)),

  // 🧩 MongoDB
  mongoUri: getEnv("MONGO_URI", "mongodb://127.0.0.1:27017/home_services"),

  // 🔑 JWT
  jwtSecret: getEnv("JWT_SECRET", "change_this_secret_in_prod"),
  jwtExpiresIn: getEnv("JWT_EXPIRES_IN", "7d"),

  // 🌐 App URLs
  app: {
    baseUrl: getEnv("BASE_URL", "http://localhost:5000"), // backend URL
    frontendUrl: getEnv("FRONTEND_URL", "http://localhost:5173"), // ✅ added for production use
  },

  // ☁️ AWS (if you use S3 later)
  aws: {
    accessKeyId: getEnv("AWS_ACCESS_KEY_ID", ""),
    secretAccessKey: getEnv("AWS_SECRET_ACCESS_KEY", ""),
    bucket: getEnv("AWS_BUCKET_NAME", ""),
    region: getEnv("AWS_REGION", "ap-south-1"),
  },

  // ☁️ Cloudinary (for image uploads)
  cloudinary: {
    cloud_name: getEnv("CLOUDINARY_CLOUD_NAME", ""),
    api_key: getEnv("CLOUDINARY_API_KEY", ""),
    api_secret: getEnv("CLOUDINARY_API_SECRET", ""),
  },

  // 🧾 Logs
  logs: {
    level: getEnv("LOG_LEVEL", "info"),
    dir: getEnv("LOG_DIR", "logs"),
  },

  // 🚦 Rate Limiting
  rateLimit: {
    windowMs: Number(getEnv("RATE_LIMIT_WINDOW_MS", 15 * 60 * 1000)),
    max: Number(getEnv("RATE_LIMIT_MAX", 100)),
  },

  // ✉️ SMTP (for email notifications)
  smtp: {
    host: getEnv("SMTP_HOST", ""),
    port: Number(getEnv("SMTP_PORT", 587)),
    secure: getEnv("SMTP_SECURE", "false") === "true",
    user: getEnv("SMTP_USER", ""),
    pass: getEnv("SMTP_PASS", ""),
    from: getEnv("SMTP_FROM", ""),
  },

  // 📱 Twilio (SMS notifications)
  twilio: {
    sid: getEnv("TWILIO_SID", ""),
    authToken: getEnv("TWILIO_AUTH_TOKEN", ""),
    from: getEnv("TWILIO_FROM", ""),
  },

  // 💳 Razorpay (for secure payments)
  razorpay: {
    keyId: getEnv("RAZORPAY_KEY_ID", ""),
    keySecret: getEnv("RAZORPAY_KEY_SECRET", ""),
  },
};

export default env;
