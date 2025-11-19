import Job from "../models/Job.js";
import WorkerProfile from "../models/WorkerProfile.js";
import { successResponse, errorResponse } from "../utils/responseBuilder.js";

/**
 * Create new job
 */
export const create = async (req, res) => {
  try {
    const body = { ...req.body };

    if (!body.worker) return errorResponse(res, "Worker is required", 400);
    if (!body.service) return errorResponse(res, "Service is required", 400);
    if (!body.scheduledDate) return errorResponse(res, "scheduledDate is required", 400);
    if (body.price == null) return errorResponse(res, "price is required", 400);

    const jobData = {
      client: req.user.id,
      worker: body.worker, // ✅ WorkerProfile ID
      service: body.service,
      customService: body.customService || "",
      description: body.description || "",
      scheduledDate: new Date(body.scheduledDate),
      price: Number(body.price),
    };

    const job = await Job.create(jobData);
    return successResponse(res, "Job created successfully", job, 201);
  } catch (err) {
    console.error("create job error:", err);
    return errorResponse(res, err.message || "Job creation failed", 400);
  }
};

/**
 * Update job status
 */
export const updateStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;

    if (!status) return errorResponse(res, "Status is required", 400);

    const updateData = { status };
    if (status === "completed") updateData.completedAt = new Date();

    // jobController.js
const job = await Job.findByIdAndUpdate(id, updateData, { new: true })
  .populate("client", "name email avatar")
  .populate({
    path: "worker",
    populate: { path: "user", select: "name email avatar" }, // ✅ yahi zaroori hai
  });


    if (!job) return errorResponse(res, "Job not found", 404);

    return successResponse(res, "Job status updated", job);
  } catch (err) {
    console.error("updateStatus error:", err);
    return errorResponse(res, err.message || "Failed to update status", 400);
  }
};

/**
 * Get jobs for logged-in user
 */
export const myJobs = async (req, res) => {
  try {
    const userId = req.user.id;
    let jobs;

    if (req.user.role === "client") {
      jobs = await Job.find({ client: userId })
        .populate({
          path: "worker",
          populate: { path: "user", select: "name email avatar" },
        })
        .populate("client", "name email avatar")
        .lean();
    } else if (req.user.role === "worker") {
      const wp = await WorkerProfile.findOne({ user: userId });
      if (!wp) return successResponse(res, "No jobs", [], 200);

      jobs = await Job.find({ worker: wp._id })
        .populate("client", "name email avatar")
        .populate({
          path: "worker",
          populate: { path: "user", select: "name email avatar" },
        })
        .lean();
    } else {
      return successResponse(res, "Invalid role", [], 200);
    }

    return successResponse(res, "Jobs fetched successfully", jobs);
  } catch (err) {
    console.error("myJobs error:", err);
    return errorResponse(res, err.message || "Failed to fetch jobs", 400);
  }
};
