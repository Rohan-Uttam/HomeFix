// backend/services/workerService.js
import WorkerProfile from "../models/WorkerProfile.js";
import User from "../models/User.js";

export const createWorkerProfile = async (userId, data) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  if (user.role !== "worker") throw new Error("Only workers can create profile");

  const profile = await WorkerProfile.create({ user: userId, ...data });
  return profile;
};

export const updateWorkerProfile = async (userId, updates) => {
  const profile = await WorkerProfile.findOneAndUpdate({ user: userId }, updates, {
    new: true,
    runValidators: true,
  });
  if (!profile) throw new Error("Worker profile not found");
  return profile;
};

export const searchWorkers = async (filters = {}) => {
  const query = {};
  if (filters.skills) query.skills = { $in: filters.skills };
  if (filters.minRate) query.hourlyRate = { $gte: filters.minRate };
  if (filters.maxRate) query.hourlyRate = { ...query.hourlyRate, $lte: filters.maxRate };

  return WorkerProfile.find(query).populate("user", "name email phone");
};
