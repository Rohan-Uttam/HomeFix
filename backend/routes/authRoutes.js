import express from "express";
import {
  register,
  login,
  profile,
  verifyOtp,
  resendOtp,
} from "../controllers/authController.js";
import validateRequest from "../middlewares/validateRequest.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/upload.js"; // multer-cloudinary or multer

const router = express.Router();

// ---------------- REGISTER ----------------
router.post(
  "/register",
  upload.single("avatar"), // accept file field named "avatar"
  (req, res, next) => {
    // lightweight debug info
    console.log("👉 Incoming Register Request:", {
      bodyKeys: Object.keys(req.body || {}).slice(0, 20),
      hasFile: !!req.file,
      fileInfo: req.file ? { originalname: req.file.originalname, fieldname: req.file.fieldname } : null,
    });
    next();
  },
  validateRequest({
    body: {
      name: { required: true, type: "string", minLength: 2 },
      email: { required: true, type: "email" },
      password: { required: true, type: "string", minLength: 6 },
      phone: { required: true, type: "string" },
      role: { required: false, type: "string" },
    },
  }),
  register
);

router.post(
  "/verify-otp",
  validateRequest({
    body: {
      email: { required: true, type: "email" },
      otp: { required: true, type: "string", minLength: 6, maxLength: 6 },
    },
  }),
  verifyOtp
);

// Resend OTP: accept { email } or { email, phone }
router.post("/resend-otp", resendOtp);

router.post(
  "/login",
  validateRequest({
    body: {
      email: { required: true, type: "email" },
      password: { required: true, type: "string" },
    },
  }),
  login
);

router.get("/profile", authenticate, profile);

export default router;
