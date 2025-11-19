// backend/services/jobService.js
import Job from "../models/Job.js";
import WorkerProfile from "../models/WorkerProfile.js";

export const createJob = async (clientId, { workerId, description, scheduledDate, price }) => {
  const worker = await WorkerProfile.findById(workerId);
  if (!worker) throw new Error("Worker not found");

  const job = await Job.create({
    client: clientId,
    worker: workerId,
    description,
    scheduledDate,
    price,
  });

  return job;
};

export const updateJobStatus = async (jobId, status) => {
  const job = await Job.findById(jobId);
  if (!job) throw new Error("Job not found");

  job.status = status;
  if (status === "completed") job.completedAt = new Date();
  await job.save();

  return job;
};

export const getJobsForUser = async (userId, role) => {
  if (role === "client") return Job.find({ client: userId }).populate("worker");
  if (role === "worker") return Job.find({ worker: userId }).populate("client");
  return [];
};
