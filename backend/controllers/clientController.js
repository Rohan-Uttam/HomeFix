// backend/controllers/clientController.js
import User from "../models/User.js";
import { getJobsForUser } from "../services/jobService.js";
import { successResponse, errorResponse } from "../utils/responseBuilder.js";

/**
 * @desc Get all jobs for client
 * @route GET /api/clients/jobs
 */
export const myJobs = async (req, res) => {
  try {
    const jobs = await getJobsForUser(req.user.id, "client");
    return successResponse(res, jobs, "Client jobs fetched successfully");
  } catch (err) {
    console.error("myJobs error:", err);
    return errorResponse(res, err.message || "Failed to fetch jobs", 400);
  }
};

/**
 * @desc Update logged-in client's profile
 * @route PUT /api/clients/profile
 */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return errorResponse(res, "Unauthorized", 401);

    // Only allow these fields to be updated on User doc
    const allowedFields = ["name", "phone"];
    const updates = {};

    for (const key of allowedFields) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    // ✅ Location (GeoJSON)
    if (req.body.location) {
      let loc;
      try {
        loc =
          typeof req.body.location === "string"
            ? JSON.parse(req.body.location)
            : req.body.location;

        if (loc?.lat && loc?.lng) {
          updates.location = {
            type: "Point",
            coordinates: [parseFloat(loc.lng) || 0, parseFloat(loc.lat) || 0], // [lng, lat]
            address: loc.address || "Not Provided",
          };
        }
      } catch (err) {
        console.warn("Invalid location JSON in client update:", err);
      }
    }

    // ✅ Avatar upload
    if (req.file) {
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const filename =
        req.file.filename ||
        req.file.path?.split("\\").pop().split("/").pop() ||
        "";
      if (filename) {
        updates.avatar = `${baseUrl}/uploads/${filename}`;
      }
    }

    const updated = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    })
      .select("-password")
      .lean();

    if (!updated) return errorResponse(res, "Client not found", 404);

    // Ensure role and avatar always present in the response
    const resultUser = {
      ...updated,
      role: updated.role || "client",
      avatar: updated.avatar || "",
    };

    return successResponse(res, resultUser, "Profile updated successfully");
  } catch (err) {
    console.error("updateProfile error:", err);
    return errorResponse(res, err.message || "Failed to update profile", 500);
  }
};
