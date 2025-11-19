import User from "../models/User.js";
import Job from "../models/Job.js";
import { successResponse, errorResponse } from "../utils/responseBuilder.js";
import { emitToAll } from "../socket.js";

// 🔹 Helper to emit realtime updates
function emitStatsUpdate(payload = null) {
  try {
    emitToAll("admin:statsUpdated", payload || { updatedAt: new Date() });
  } catch (err) {
    console.warn("⚠️ emitStatsUpdate failed:", err.message);
  }
}

/**
 * @desc Get system stats + analytics
 * @route GET /api/admin/stats
 */
export const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalWorkers = await User.countDocuments({ role: /worker/i });
    const totalClients = await User.countDocuments({ role: /client/i });
    const totalJobs = await Job.countDocuments();

    const revenueAgg = await Job.aggregate([
      { $match: { status: "completed", price: { $exists: true } } },
      { $group: { _id: null, total: { $sum: "$price" } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    const userGrowth = await User.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%b", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const jobsByStatus = await Job.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const revenueByMonth = await Job.aggregate([
      { $match: { status: "completed", price: { $exists: true } } },
      {
        $group: {
          _id: { $dateToString: { format: "%b", date: "$completedAt" } },
          total: { $sum: "$price" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const responseData = {
      totalUsers,
      totalWorkers,
      totalClients,
      totalJobs,
      totalRevenue,
      analytics: {
        userGrowth: userGrowth || [],
        jobsByStatus: jobsByStatus || [],
        revenueByMonth: revenueByMonth || [],
      },
    };

    emitStatsUpdate(responseData);
    return successResponse(res, "Admin stats fetched", responseData);
  } catch (err) {
    return errorResponse(res, err.message || "Failed to fetch stats", 500);
  }
};

/**
 * @desc Get all users
 * @route GET /api/admin/users
 */
export const getUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    let query = {};
    if (role && role !== "all") query.role = new RegExp(role, "i");
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query).select("-password").lean();
    return successResponse(res, "All users fetched", users);
  } catch (err) {
    return errorResponse(res, err.message || "Failed to fetch users", 500);
  }
};

/**
 * @desc Get only clients (paginated)
 * @route GET /api/admin/clients
 */
export const getClients = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(100, parseInt(req.query.limit || "20", 10));
    const search = req.query.search || "";

    const filter = { role: /client/i };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const [count, clients] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .select("-password")
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    return successResponse(res, "Clients fetched", {
      total: count,
      page,
      limit,
      data: clients,
    });
  } catch (err) {
    return errorResponse(res, err.message || "Failed to fetch clients", 500);
  }
};

/**
 * @desc Get only workers (paginated)
 * @route GET /api/admin/workers
 */
export const getWorkers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(100, parseInt(req.query.limit || "20", 10));
    const search = req.query.search || "";

    const filter = { role: /worker/i };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const [count, workers] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .select("-password")
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    return successResponse(res, "Workers fetched", {
      total: count,
      page,
      limit,
      data: workers,
    });
  } catch (err) {
    return errorResponse(res, err.message || "Failed to fetch workers", 500);
  }
};

/**
 * @desc Delete user
 * @route DELETE /api/admin/users/:id
 */
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return errorResponse(res, "User not found", 404);

    emitStatsUpdate({ userDeleted: req.params.id });
    return successResponse(res, "User deleted successfully", null);
  } catch (err) {
    return errorResponse(res, err.message || "Failed to delete user", 500);
  }
};

/**
 * @desc Toggle block/unblock
 * @route PATCH /api/admin/users/:id/block
 */
export const toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return errorResponse(res, "User not found", 404);

    user.isBlocked = !user.isBlocked;
    await user.save();

    emitStatsUpdate({ userBlockedToggle: req.params.id });
    return successResponse(res, "User block status updated", {
      id: user._id,
      isBlocked: user.isBlocked,
    });
  } catch (err) {
    return errorResponse(res, err.message || "Failed to toggle block", 500);
  }
};

/**
 * @desc Get jobs
 * @route GET /api/admin/jobs
 */
export const getJobs = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};
    if (status && status !== "all") query.status = status;
    if (search) {
      query.$or = [
        { service: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const jobs = await Job.find(query)
      .populate("client", "name email")
      .populate({
        path: "worker",
        populate: { path: "user", select: "name email avatar" }, // ✅ Fix
      })
      .lean();

    return successResponse(res, "All jobs fetched", jobs);
  } catch (err) {
    return errorResponse(res, err.message || "Failed to fetch jobs", 500);
  }
};



/**
 * @desc Delete job
 * @route DELETE /api/admin/jobs/:id
 */
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return errorResponse(res, "Job not found", 404);

    emitStatsUpdate({ jobDeleted: req.params.id });
    return successResponse(res, "Job deleted successfully", null);
  } catch (err) {
    return errorResponse(res, err.message || "Failed to delete job", 500);
  }
};

/**
 * @desc Update job status
 * @route PATCH /api/admin/jobs/:id/status
 */
export const updateJobStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const job = await Job.findById(req.params.id);
    if (!job) return errorResponse(res, "Job not found", 404);

    job.status = status;
    if (status === "completed") job.completedAt = new Date();
    await job.save();

    emitStatsUpdate({ jobStatusUpdated: req.params.id, status });
    return successResponse(res, "Job status updated", job);
  } catch (err) {
    return errorResponse(res, err.message || "Failed to update job status", 500);
  }
};

export default {
  getStats,
  getUsers,
  getClients,
  getWorkers,
  getJobs,
  deleteUser,
  toggleBlockUser,
  deleteJob,
  updateJobStatus,
};
