// backend/services/paymentService.js
import Payment from "../models/Payment.js";
import Job from "../models/Job.js";

export const recordPayment = async ({ jobId, clientId, workerId, amount, method, transactionId }) => {
  const job = await Job.findById(jobId);
  if (!job) throw new Error("Job not found");

  const payment = await Payment.create({
    job: jobId,
    client: clientId,
    worker: workerId,
    amount,
    paymentMethod: method,
    transactionId,
    status: "paid",
  });

  job.payment = payment._id;
  await job.save();

  return payment;
};

export const getPaymentsForUser = async (userId, role) => {
  if (role === "client") return Payment.find({ client: userId });
  if (role === "worker") return Payment.find({ worker: userId });
  return [];
};
