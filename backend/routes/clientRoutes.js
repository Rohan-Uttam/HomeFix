// backend/routes/clientRoutes.js
import express from "express";
import { myJobs, updateProfile } from "../controllers/clientController.js";
import { authenticate, authorize } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js"; // multer middleware

const router = express.Router();

/**
 * @route PUT /api/clients/profile
 * @desc Update profile (Client only) — supports avatar upload
 * @access Private (client)
 */
router.put(
  "/profile",
  authenticate,
  authorize("client"),
  (req, res, next) => {
    // ✅ Multer error handling wrapper
    upload.single("avatar")(req, res, (err) => {
      if (err) {
        console.error("Multer upload error:", err);
        return res
          .status(400)
          .json({ success: false, message: "File upload failed", error: err.message });
      }
      next();
    });
  },
  updateProfile
);

/**
 * @route GET /api/clients/jobs
 * @desc Get all jobs for client
 * @access Private (client)
 */
router.get("/jobs", authenticate, authorize("client"), myJobs);

export default router;
