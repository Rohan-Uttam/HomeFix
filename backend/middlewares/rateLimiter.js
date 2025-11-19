import rateLimit from "express-rate-limit";
import env from "../config/env.js";

// ⚡ Local/dev me limiter off rakho
const isDev = env.nodeEnv !== "production";

const limiter = isDev
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: env.rateLimit?.windowMs || 15 * 60 * 1000, // default 15 min
      max: env.rateLimit?.max || 100, // default 100 requests per window
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        message: "Too many requests, please try again later.",
      },
    });

export default limiter;
