// backend/controllers/bookingController.js
import Booking from "../models/Booking.js";
import WorkerProfile from "../models/WorkerProfile.js";
import { successResponse, errorResponse } from "../utils/responseBuilder.js";
import { sendInApp, sendEmail } from "../utils/notify.js";
import { v4 as uuidv4 } from "uuid";
import { recommendWorkers } from "../services/recommendService.js";
import Job from "../models/Job.js";

/* ---------------------------------------------
   🔧 Helper: Create Job from Booking (if not exists)
---------------------------------------------- */
const createJobIfNotExists = async (booking) => {
  try {
    const existing = await Job.findOne({ booking: booking._id });
    if (existing) return existing;

    const serviceStr =
      booking.service?.subcategory ||
      booking.service?.category ||
      booking.customService ||
      "Service";

    const jobData = {
      booking: booking._id,
      client: booking.client._id ? booking.client._id : booking.client,
      worker: booking.worker._id ? booking.worker._id : booking.worker,
      service: serviceStr,
      customService: booking.customService || "",
      description: booking.notes || "Booking from client",
      scheduledDate: booking.scheduledDate || booking.createdAt || new Date(),
      price: booking.price || 0,
      status: booking.status || "pending",
    };

    return await Job.create(jobData);
  } catch (err) {
    console.error("createJobIfNotExists error:", err);
    return null;
  }
};

/* ---------------------------------------------
   📦 Create Booking — Handles all skill edge cases
---------------------------------------------- */
export const createBooking = async (req, res) => {
  try {
    const { workerId, price, notes } = req.body;

    if (!workerId || !price)
      return errorResponse(res, "WorkerId and Price are required", 400);

    const worker = await WorkerProfile.findById(workerId).populate("user");
    if (!worker) return errorResponse(res, "Worker not found", 404);

    // 🧠 Skill Extraction Logic
    let safeSkills = [];

    if (Array.isArray(worker.skills) && worker.skills.length > 0) {
      safeSkills = worker.skills
        .map((s) => (typeof s === "string" ? s.trim() : ""))
        .filter((s) => s && s.toLowerCase() !== "n/a");
    } else if (typeof worker.skills === "string") {
      try {
        const parsed = JSON.parse(worker.skills.replace(/'/g, '"'));
        if (Array.isArray(parsed)) {
          safeSkills = parsed.filter(
            (s) => typeof s === "string" && s.trim() && s.toLowerCase() !== "n/a"
          );
        }
      } catch {
        safeSkills = [];
      }
    }

    // ✅ Fallback: handle 'other' category or empty skills
    if (
      safeSkills.length === 0 &&
      (worker.category?.toLowerCase() === "other" || !worker.skills?.length)
    ) {
      const fallbackSkill =
        worker.subcategory ||
        worker.customCategory ||
        worker.customService ||
        "General Service";
      safeSkills = [fallbackSkill.trim()];
    }

    console.log(" Final Safe Skills Used:", safeSkills);

    // 🧾 Create new booking
    const booking = await Booking.create({
      client: req.user.id,
      worker: worker._id,
      service: {
        category: worker.category || "General",
        subcategory: worker.subcategory || "",
        skills: safeSkills,
      },
      price,
      notes,
      paymentStatus: "pending",
      status: "pending",
    });

    // 🔔 Notify worker safely
    try {
      const clientName = req.user?.name || "A client";
      await sendInApp({
        recipientId: worker.user?._id ?? worker._id,
        actorId: req.user.id,
        type: "booking_request",
        title: "New Booking Request",
        message: `${clientName} requested a job (₹${price}).`,
        data: { bookingId: booking._id, workerProfileId: worker._id },
        phone: worker.user?.phone || null,
      });

      if (worker.user?.email) {
        await sendEmail({
          to: worker.user.email,
          subject: "New Job Request",
          text: `${clientName} requested a job. Price: ₹${price}.`,
        });
      }
    } catch (err) {
      console.error("Notification error (non-fatal):", err.message);
    }

    return successResponse(
      res,
      "Booking created successfully",
      { ...booking.toObject(), id: booking._id },
      201
    );
  } catch (err) {
    console.error("createBooking error:", err);
    return errorResponse(res, "Failed to create booking", 500, [err.message]);
  }
};

/* ---------------------------------------------
   📋 Get Client Bookings — Auto-fix old records
---------------------------------------------- */
export const getClientBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ client: req.user.id })
      .populate({
        path: "worker",
        model: "WorkerProfile",
        populate: {
          path: "user",
          model: "User",
          select: "name email phone avatar",
        },
        select:
          "skills category subcategory experience hourlyRate rateType rating totalReviews profileImage isSharingLocation currentLocation",
      })
      .populate("client", "name email phone avatar")
      .sort({ createdAt: -1 });

    const cleanBookings = bookings.map((b) => {
      let workerSkills = [];

      if (Array.isArray(b?.worker?.skills) && b.worker.skills.length > 0) {
        workerSkills = b.worker.skills.filter(
          (s) => s && s.trim() && s.toLowerCase() !== "n/a"
        );
      } else if (
        Array.isArray(b?.service?.skills) &&
        b.service.skills.length > 0
      ) {
        workerSkills = b.service.skills.filter(
          (s) => s && s.trim() && s.toLowerCase() !== "n/a"
        );
      } else if (b?.worker?.category?.toLowerCase() === "other") {
        const fallbackSkill =
          b.worker.subcategory ||
          b.worker.customCategory ||
          b.worker.customService ||
          "General Service";
        workerSkills = [fallbackSkill.trim()];
      }

      return {
        ...b.toObject(),
        worker: {
          ...b.worker?.toObject(),
          skills: workerSkills,
        },
      };
    });

    return successResponse(res, "Client bookings fetched", cleanBookings, 200);
  } catch (err) {
    console.error("getClientBookings error:", err);
    return errorResponse(res, "Failed to fetch client bookings", 500, [
      err.message,
    ]);
  }
};

/* ---------------------------------------------
   🧰 Get Worker Bookings
---------------------------------------------- */
export const getWorkerBookings = async (req, res) => {
  try {
    const workerProfile = await WorkerProfile.findOne({ user: req.user.id });
    if (!workerProfile)
      return errorResponse(res, "Worker profile not found", 404);

    const bookings = await Booking.find({ worker: workerProfile._id })
      .populate("client", "_id name email phone avatar")
      .sort({ createdAt: -1 });

    return successResponse(res, "Worker bookings fetched", bookings, 200);
  } catch (err) {
    console.error("getWorkerBookings error:", err);
    return errorResponse(res, "Failed to fetch worker bookings", 500, [
      err.message,
    ]);
  }
};

/* ---------------------------------------------
   🔄 Booking Status Update
---------------------------------------------- */
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = [
      "pending",
      "accepted",
      "rejected",
      "completed",
      "cancelled",
      "arrived",
    ];
    if (!allowed.includes(status))
      return errorResponse(res, "Invalid status", 400);

    const booking = await Booking.findById(req.params.id)
      .populate("client", "name email phone")
      .populate({
        path: "worker",
        populate: { path: "user", select: "name email phone" },
      });

    if (!booking) return errorResponse(res, "Booking not found", 404);

    // 🎯 Status transitions
    if (status === "completed") {
      booking.status = "completed";
      booking.paymentStatus = "pending";

      if (booking.liveSession?.active) {
        booking.liveSession.active = false;
        booking.liveSession.stoppedAt = new Date();

        await WorkerProfile.findByIdAndUpdate(booking.worker._id, {
          isSharingLocation: false,
        }).catch((e) =>
          console.error("Failed to disable location sharing:", e)
        );
      }
    } else {
      booking.status = status;
    }

    await booking.save();

    // ✅ Create Job if accepted
    if (status === "accepted") {
      await createJobIfNotExists(booking).catch((e) =>
        console.error("Job creation error:", e)
      );
    }

    const client = booking.client;
    const workerUser = booking.worker?.user;
    const message = `${workerUser?.name || "Worker"} updated booking status to ${status}.`;

    if (client?._id) {
      await sendInApp({
        recipientId: client._id,
        actorId: workerUser?._id ?? null,
        type: "booking_update",
        title: `Booking ${status}`,
        message,
        data: { bookingId: booking._id },
        phone: client.phone || null,
      });

      if (client.email) {
        await sendEmail({
          to: client.email,
          subject: `Booking ${status}`,
          text: message,
        });
      }
    }

    return successResponse(res, "Booking status updated", booking, 200);
  } catch (err) {
    console.error("updateBookingStatus error:", err);
    return errorResponse(res, "Failed to update booking", 500, [err.message]);
  }
};

/* ---------------------------------------------
   💰 Update Payment Status
---------------------------------------------- */
export const updatePaymentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["pending", "paid", "failed"];
    if (!allowed.includes(status))
      return errorResponse(res, "Invalid payment status", 400);

    const booking = await Booking.findById(req.params.id)
      .populate("client", "name email phone")
      .populate({
        path: "worker",
        populate: { path: "user", select: "name email phone" },
      });

    if (!booking) return errorResponse(res, "Booking not found", 404);

    booking.paymentStatus = status;
    await booking.save();

    if (status === "paid") {
      const job = await createJobIfNotExists(booking);
      if (job) {
        job.status = "completed";
        job.completedAt = new Date();
        await job.save();
      }
    }

    const workerUser = booking.worker?.user;
    const client = booking.client;
    const message =
      status === "paid"
        ? `${client?.name || "Client"} completed payment of ₹${booking.price}.`
        : `${client?.name || "Client"}'s payment ${status}.`;

    if (workerUser?._id) {
      await sendInApp({
        recipientId: workerUser._id,
        actorId: client?._id ?? null,
        type: "payment_update",
        title: `Payment ${status}`,
        message,
        data: { bookingId: booking._id },
        phone: workerUser?.phone || null,
      });

      if (workerUser.email) {
        await sendEmail({
          to: workerUser.email,
          subject: `Payment ${status} for Booking`,
          text: message,
        });
      }
    }

    return successResponse(res, "Payment status updated", booking, 200);
  } catch (err) {
    console.error("updatePaymentStatus error:", err);
    return errorResponse(res, "Failed to update payment", 500, [err.message]);
  }
};

/* ---------------------------------------------
   📍 Live Session Controls
---------------------------------------------- */
export const startLiveSession = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("worker");
    if (!booking) return errorResponse(res, "Booking not found", 404);

    const workerProfile = await WorkerProfile.findOne({ user: req.user.id });
    if (
      !workerProfile ||
      booking.worker._id.toString() !== workerProfile._id.toString()
    ) {
      return errorResponse(res, "Not authorized", 403);
    }

    if (booking.liveSession?.active && booking.liveSession?.sessionId) {
      return successResponse(
        res,
        "Live session already active",
        { sessionId: booking.liveSession.sessionId },
        200
      );
    }

    const sessionId = uuidv4();
    booking.liveSession = { sessionId, active: true, startedAt: new Date() };
    await booking.save();

    await WorkerProfile.findByIdAndUpdate(workerProfile._id, {
      isSharingLocation: true,
    });

    return successResponse(res, "Live session started", { sessionId }, 200);
  } catch (err) {
    console.error("startLiveSession error:", err);
    return errorResponse(res, "Failed to start live session", 500, [
      err.message,
    ]);
  }
};

export const stopLiveSession = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return errorResponse(res, "Booking not found", 404);

    const workerProfile = await WorkerProfile.findOne({ user: req.user.id });
    if (
      !workerProfile ||
      booking.worker.toString() !== workerProfile._id.toString()
    ) {
      return errorResponse(res, "Not authorized", 403);
    }

    booking.liveSession = {
      ...booking.liveSession,
      active: false,
      stoppedAt: new Date(),
    };
    await booking.save();

    await WorkerProfile.findByIdAndUpdate(workerProfile._id, {
      isSharingLocation: false,
    });

    return successResponse(res, "Live session stopped", booking.liveSession, 200);
  } catch (err) {
    console.error("stopLiveSession error:", err);
    return errorResponse(res, "Failed to stop live session", 500, [
      err.message,
    ]);
  }
};

/* ---------------------------------------------
   🤖 Recommend Workers
---------------------------------------------- */
export const recommendWorkersController = async (req, res) => {
  try {
    const { category, skills, clientCoords } = req.body;
    if (!category || !clientCoords)
      return errorResponse(res, "Category and clientCoords required", 400);

    const results = await recommendWorkers({
      category,
      skills: skills || [],
      clientCoords: [clientCoords.lng, clientCoords.lat],
    });

    const formatted = results.map((r) => ({
      workerId: r.worker._id,
      name: r.worker.user?.name,
      email: r.worker.user?.email,
      phone: r.worker.user?.phone,
      avatar: r.worker.user?.avatar || r.worker.profileImage,
      rating: r.worker.rating,
      totalReviews: r.worker.totalReviews,
      distanceKm: r.distance,
      score: r.score,
      skills: r.worker.skills,
      category: r.worker.category,
      subcategory: r.worker.subcategory,
    }));

    return successResponse(res, "Recommended workers fetched", formatted, 200);
  } catch (err) {
    console.error("recommendWorkersController error:", err);
    return errorResponse(res, "Failed to fetch recommendations", 500, [
      err.message,
    ]);
  }
};
