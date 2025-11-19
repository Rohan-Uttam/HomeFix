import WorkerProfile from "../models/WorkerProfile.js";
import User from "../models/User.js";
import Review from "../models/Review.js";
import { successResponse, errorResponse } from "../utils/responseBuilder.js";
import env from "../config/env.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

const BASE_URL = env.app?.baseUrl || "http://localhost:5000";

/**
 * 📤 Upload Image (Cloudinary or Local)
 */
const uploadImage = async (filePath) => {
  try {
    if (env.cloudinary.cloud_name && env.cloudinary.api_key) {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: "home-services/workers",
        resource_type: "image",
      });
      fs.unlinkSync(filePath);
      return result.secure_url;
    }
    return `${BASE_URL}/uploads/${filePath.split("/").pop()}`;
  } catch (err) {
    console.error("Cloudinary upload failed:", err.message);
    return `${BASE_URL}/uploads/${filePath.split("/").pop()}`;
  }
};

/**
 * 🧩 Get all workers
 */
export const getAllWorkers = async (req, res) => {
  try {
    const workers = await WorkerProfile.find()
      .populate("user", "name email phone avatar role")
      .lean();

    return successResponse(res, "Workers fetched successfully", workers, 200);
  } catch (err) {
    console.error("getAllWorkers error:", err);
    return errorResponse(res, "Failed to fetch workers", 500, [err.message]);
  }
};

/**
 * 🧩 Get logged-in worker profile
 */
export const getMyProfile = async (req, res) => {
  try {
    const profile = await WorkerProfile.findOne({ user: req.user.id })
      .populate("user", "name email phone avatar role")
      .lean();

    if (!profile) return errorResponse(res, "No profile found", 404);
    return successResponse(res, "Worker profile fetched", profile, 200);
  } catch (err) {
    console.error("getMyProfile error:", err);
    return errorResponse(res, "Failed to fetch profile", 500, [err.message]);
  }
};

/**
 * 🧭 Get Nearby Workers (with filters + address match)
 */
export const getNearbyWorkers = async (req, res) => {
  try {
    const { lat, lng, radius = 5000 } = req.query;
    const address = req.query.address?.trim();

    if (!lat || !lng)
      return errorResponse(res, "Latitude and Longitude required", 400);

    const match = {};
    if (req.query.category) {
      if (String(req.query.category).toLowerCase() === "other") {
        if (req.query.customCategory) {
          match.customCategory = {
            $regex: req.query.customCategory,
            $options: "i",
          };
        } else {
          match.$or = [
            { customCategory: { $exists: true, $ne: "" } },
            { category: { $regex: "^other$", $options: "i" } },
          ];
        }
      } else {
        match.category = { $regex: req.query.category, $options: "i" };
      }
    }

    if (req.query.subcategory)
      match.subcategory = { $regex: req.query.subcategory, $options: "i" };

    if (req.query.minRate || req.query.maxRate) {
      match.hourlyRate = {};
      if (req.query.minRate) match.hourlyRate.$gte = Number(req.query.minRate);
      if (req.query.maxRate) match.hourlyRate.$lte = Number(req.query.maxRate);
    }

    const addressRegex = address ? new RegExp(address, "i") : null;

    const pipeline = [
      {
        $geoNear: {
          near: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          distanceField: "distance",
          spherical: true,
          maxDistance: parseInt(radius),
          key: "location",
        },
      },
    ];

    if (Object.keys(match).length) pipeline.push({ $match: match });

    pipeline.push(
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userDoc",
        },
      },
      { $unwind: { path: "$userDoc", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          isExactMatch: addressRegex
            ? {
                $cond: [
                  { $regexMatch: { input: "$location.address", regex: addressRegex } },
                  1,
                  0,
                ],
              }
            : 0,
        },
      },
      { $sort: { isExactMatch: -1, distance: 1 } },
      {
        $project: {
          user: {
            _id: "$userDoc._id",
            name: "$userDoc.name",
            email: "$userDoc.email",
            phone: "$userDoc.phone",
            avatar: "$userDoc.avatar",
            role: "$userDoc.role",
          },
          skills: 1,
          hourlyRate: 1,
          rateType: 1,
          experience: 1,
          bio: 1,
          availability: 1,
          profileImage: 1,
          location: 1,
          rating: 1,
          totalReviews: 1,
          category: 1,
          subcategory: 1,
          customCategory: 1,
          distance: 1,
          isExactMatch: 1,
        },
      }
    );

    const workers = await WorkerProfile.aggregate(pipeline);
    return successResponse(res, "Nearby workers fetched", workers, 200);
  } catch (err) {
    console.error("getNearbyWorkers error:", err);
    return errorResponse(res, "Failed to fetch nearby workers", 500, [err.message]);
  }
};

/**
 * 🔍 Search Workers (Advanced)
 */
export const searchWorkers = async (req, res) => {
  try {
    const {
      category,
      subcategory,
      customCategory,
      minRate,
      maxRate,
      location,
      q,
      sort,
      limit = 20,
      page = 1,
    } = req.query || {};

    const match = {};

    if (category) {
      if (String(category).toLowerCase() === "other") {
        if (customCategory) {
          match.customCategory = { $regex: customCategory, $options: "i" };
        } else {
          match.$or = [
            { customCategory: { $exists: true, $ne: "" } },
            { category: { $regex: "^other$", $options: "i" } },
          ];
        }
      } else {
        match.category = { $regex: category, $options: "i" };
      }
    }

    if (subcategory) match.subcategory = { $regex: subcategory, $options: "i" };

    if (minRate || maxRate) {
      match.hourlyRate = {};
      if (minRate) match.hourlyRate.$gte = Number(minRate);
      if (maxRate) match.hourlyRate.$lte = Number(maxRate);
    }

    if (location)
      match["location.address"] = { $regex: location, $options: "i" };

    const pipeline = [];
    if (Object.keys(match).length) pipeline.push({ $match: match });

    pipeline.push({
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "userDoc",
      },
    });

    pipeline.push({ $unwind: { path: "$userDoc", preserveNullAndEmptyArrays: true } });

    if (q) {
      const qRegex = new RegExp(q, "i");
      pipeline.push({
        $match: {
          $or: [
            { "userDoc.name": { $regex: qRegex } },
            { bio: { $regex: qRegex } },
            { skills: { $elemMatch: { $regex: qRegex } } },
            { customCategory: { $regex: qRegex } },
            { category: { $regex: qRegex } },
            { subcategory: { $regex: qRegex } },
          ],
        },
      });
    }

    pipeline.push({
      $addFields: {
        user: "$userDoc",
        hourlyRateSafe: { $ifNull: ["$hourlyRate", 0] },
        ratingSafe: { $ifNull: ["$rating", 0] },
      },
    });

    const sortStage = {};
    if (sort === "price_asc") sortStage.hourlyRateSafe = 1;
    else if (sort === "price_desc") sortStage.hourlyRateSafe = -1;
    else if (sort === "rating_desc") sortStage.ratingSafe = -1;
    else if (sort === "rating_asc") sortStage.ratingSafe = 1;
    else sortStage._id = -1;

    pipeline.push({ $sort: sortStage });

    const lim = Math.max(1, Math.min(100, Number(limit)));
    const skip = Math.max(0, (Number(page) - 1) * lim);
    pipeline.push({ $skip: skip }, { $limit: lim });

    pipeline.push({
      $project: {
        user: {
          _id: "$user._id",
          name: "$user.name",
          email: "$user.email",
          phone: "$user.phone",
          avatar: "$user.avatar",
          role: "$user.role",
        },
        skills: 1,
        hourlyRate: 1,
        rateType: 1,
        experience: 1,
        bio: 1,
        availability: 1,
        profileImage: 1,
        location: 1,
        rating: 1,
        totalReviews: 1,
        category: 1,
        subcategory: 1,
        customCategory: 1,
      },
    });

    const results = await WorkerProfile.aggregate(pipeline).allowDiskUse(true);
    return successResponse(res, "Search results", results, 200);
  } catch (err) {
    console.error("searchWorkers error:", err);
    return errorResponse(res, "Search failed", 500, [err.message]);
  }
};

/**
 * 🧩 Create Worker Profile
 */
export const createProfile = async (req, res) => {
  try {
    const payload = { ...req.body, user: req.user.id };

    if (!payload.location)
      return errorResponse(res, "Location is required (lat & lng)", 400);

    const locObj =
      typeof payload.location === "string"
        ? JSON.parse(payload.location)
        : payload.location;

    if (locObj.lat == null || locObj.lng == null)
      return errorResponse(res, "Location must include lat and lng", 400);

    payload.location = {
      type: "Point",
      coordinates: [parseFloat(locObj.lng), parseFloat(locObj.lat)],
      address: locObj.address || "",
    };

    if (payload.category?.toLowerCase() === "other") {
      payload.customCategory = payload.customCategory?.trim() || "";
    } else {
      payload.customCategory = "";
    }

    const profile = await WorkerProfile.create(payload);

    return successResponse(res, "Worker profile created", profile, 201);
  } catch (err) {
    console.error("createProfile error:", err);
    return errorResponse(res, "Failed to create profile", 400, [err.message]);
  }
};

/**
 * 🧩 Update Worker Profile (Cloudinary integrated)
 */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const body = { ...req.body };

    const userUpdates = {};
    const workerUpdates = {};

    // ✅ Upload image if present
    if (req.file) {
      const uploadedUrl = await uploadImage(req.file.path);
      userUpdates.avatar = uploadedUrl;
      workerUpdates.profileImage = uploadedUrl;
    }

    // ✅ Basic details
    if (body.name) userUpdates.name = body.name;
    if (body.phone) userUpdates.phone = body.phone;

    // ✅ Category logic
    if (body.category) {
      workerUpdates.category = body.category;
      if (body.category.toLowerCase() === "other" && body.customCategory?.trim()) {
        workerUpdates.customCategory = body.customCategory.trim();
      } else {
        workerUpdates.customCategory = "";
      }
    }

    if (body.subcategory) workerUpdates.subcategory = body.subcategory;
    if (body.skills)
      workerUpdates.skills = Array.isArray(body.skills)
        ? body.skills
        : body.skills.split(",").map((s) => s.trim());
    if (body.hourlyRate) workerUpdates.hourlyRate = Number(body.hourlyRate);
    if (body.experience) workerUpdates.experience = Number(body.experience);
    if (body.bio) workerUpdates.bio = body.bio;
    if (body.availability) workerUpdates.availability = body.availability;

    // ✅ Location update
    if (body.location) {
      const loc =
        typeof body.location === "string"
          ? JSON.parse(body.location)
          : body.location;

      workerUpdates.location = {
        type: "Point",
        coordinates: [parseFloat(loc.lng), parseFloat(loc.lat)],
        address: loc.address || "",
      };
    }

    await User.findByIdAndUpdate(userId, userUpdates, { new: true });
    const updatedWorker = await WorkerProfile.findOneAndUpdate(
      { user: userId },
      workerUpdates,
      { new: true, runValidators: true }
    ).populate("user", "name email phone avatar role");

    if (!updatedWorker)
      return errorResponse(res, "Worker profile not found", 404);

    return successResponse(
      res,
      "Worker profile updated successfully",
      updatedWorker,
      200
    );
  } catch (err) {
    console.error("updateProfile error:", err);
    return errorResponse(res, "Failed to update profile", 400, [err.message]);
  }
};

/**
 * ⭐ Recalculate Worker Rating After New Review
 */
export const recalcWorkerRating = async (workerId) => {
  try {
    const stats = await Review.aggregate([
      { $match: { worker: workerId } },
      {
        $group: {
          _id: "$worker",
          avgRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      await WorkerProfile.findByIdAndUpdate(workerId, {
        rating: Math.round(stats[0].avgRating * 10) / 10,
        totalReviews: stats[0].totalReviews,
      });
    } else {
      await WorkerProfile.findByIdAndUpdate(workerId, {
        rating: 0,
        totalReviews: 0,
      });
    }
  } catch (err) {
    console.error("Rating recalculation failed:", err.message);
  }
};
