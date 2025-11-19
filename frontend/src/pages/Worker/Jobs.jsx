import { useEffect, useState } from "react";
import { bookingApi } from "../../api/bookingApi.js";
import { reviewApi } from "../../api/reviewApi.js";
import toast from "react-hot-toast";
import ChatWindow from "../../components/ChatWindow.jsx";
import { getSocket } from "../../utils/socketClient.js";

export default function WorkerJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsMap, setReviewsMap] = useState({});
  const [selectedChatBooking, setSelectedChatBooking] = useState(null);
  const [loadingAction, setLoadingAction] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const res = await bookingApi.getWorkerBookings();
        setJobs(res.data?.data || []);
      } catch (err) {
        console.error("Failed to load worker bookings:", err);
        toast.error("Failed to load worker bookings");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const updateStatus = async (id, status) => {
    if (loadingAction) return;
    setLoadingAction(id + "-" + status);
    try {
      await bookingApi.updateStatus(id, status);
      setJobs((prev) => prev.map((j) => (j._id === id ? { ...j, status } : j)));
      toast.success(`Job ${status}`);
    } catch (err) {
      console.error("Failed to update booking:", err);
      toast.error("Update failed");
    } finally {
      setLoadingAction(null);
    }
  };

  const startTracking = async (job) => {
    if (loadingAction) return;
    setLoadingAction(job._id + "-track");
    try {
      const res = await bookingApi.startLive(job._id);
      toast.success("🚗 Live tracking started!");
      const sessionId = res.data?.data?.sessionId;

      if (navigator.geolocation) {
        const socket = getSocket();
        navigator.geolocation.watchPosition((pos) => {
          socket.emit("live:location", {
            sessionId,
            coords: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          });
        });
      }

      setJobs((prev) =>
        prev.map((j) =>
          j._id === job._id
            ? { ...j, liveSession: { active: true, sessionId } }
            : j
        )
      );
    } catch (err) {
      console.error("Failed to start tracking:", err);
      toast.error("Failed to start live tracking");
    } finally {
      setLoadingAction(null);
    }
  };

  const stopTracking = async (job) => {
    if (loadingAction) return;
    setLoadingAction(job._id + "-stop");
    try {
      await bookingApi.stopLive(job._id);
      toast.success("Live tracking stopped");
      setJobs((prev) =>
        prev.map((j) =>
          j._id === job._id ? { ...j, liveSession: { active: false } } : j
        )
      );
    } catch (err) {
      console.error("❌ Failed to stop tracking:", err);
      toast.error("Failed to stop live tracking");
    } finally {
      setLoadingAction(null);
    }
  };

  useEffect(() => {
    const loadReviews = async () => {
      const completedJobs = jobs.filter((j) => j.status === "completed");
      for (const job of completedJobs) {
        try {
          const res = await reviewApi.getJobReviews(job._id);
          setReviewsMap((prev) => ({
            ...prev,
            [job._id]: res.data?.data || [],
          }));
        } catch (err) {
          console.error("❌ Failed to load reviews for job:", job._id, err);
        }
      }
    };
    if (jobs.length > 0) loadReviews();
  }, [jobs]);

  if (loading)
    return (
      <p className="text-center mt-10 text-gray-600 animate-pulse">
        ⏳ Loading jobs...
      </p>
    );

  if (!jobs.length)
    return (
      <p className="text-center mt-10 text-gray-500 font-medium">
        No job requests yet
      </p>
    );

  const Spinner = () => (
    <svg
      className="animate-spin h-4 w-4 mr-2 text-white inline-block"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8H4z"
      ></path>
    </svg>
  );

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-sky-50 via-indigo-50 to-purple-100 py-14 px-5">
      <h2 className="text-4xl font-extrabold mb-14 text-center bg-gradient-to-r from-sky-500 via-purple-500 to-indigo-600 bg-clip-text text-transparent drop-shadow-lg">
        🏠 My Jobs
      </h2>

      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 justify-center relative z-10">
        {jobs.map((job) => (
          <div
            key={job._id}
            className="relative flex flex-col justify-between items-center p-6 rounded-3xl bg-gradient-to-br from-white/90 via-sky-50/90 to-indigo-50/90 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:shadow-[0_15px_45px_rgba(79,70,229,0.25)] hover:-translate-y-3 hover:scale-[1.02] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden"
          >
            <div className="mt-2 flex flex-col items-center text-center">
              <img
                src={
                  job.client?.avatar && job.client.avatar.trim() !== ""
                    ? job.client.avatar
                    : "/default-avatar.png"
                }
                alt={job.client?.name || "Client"}
                className="w-[85px] h-[85px] rounded-full object-cover border-2 border-sky-500 shadow-md mb-2"
                onError={(e) => (e.currentTarget.src = "/default-avatar.png")}
              />
              <h3 className="text-lg font-bold text-gray-800">
                {job.client?.name || "Unnamed Client"}
              </h3>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Service:</span>{" "}
                {job.service?.subcategory || job.service?.category || "N/A"}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Price:</span> ₹{job.price}
              </p>
            </div>

            {/* Status Section */}
            <div className="mt-4 border-t border-gray-200 pt-3 text-center text-sm text-gray-700 w-full">
              <p className="mb-1">
                <span className="font-semibold">Status:</span>{" "}
                <span
                  className={`px-3 py-[3px] rounded-full text-white text-xs shadow-sm capitalize ${
                    job.status === "pending"
                      ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                      : job.status === "accepted"
                      ? "bg-gradient-to-r from-green-400 to-emerald-600"
                      : job.status === "arrived"
                      ? "bg-gradient-to-r from-purple-400 to-indigo-600"
                      : job.status === "completed"
                      ? "bg-gradient-to-r from-sky-500 to-cyan-600"
                      : "bg-red-500"
                  }`}
                >
                  {job.status}
                </span>
              </p>

              {/* 💰 Payment Completed Badge */}
              {job.status === "completed" && job.paymentStatus === "paid" && (
                <p className="mt-1 text-[13px] font-semibold text-green-600 bg-green-50 border border-green-200 rounded-md px-3 py-1 inline-block shadow-sm">
                  💰 Payment Completed
                </p>
              )}

              <p className="text-[11px] text-gray-500 mb-2">
                📅 {new Date(job.createdAt).toLocaleString()}
              </p>

              {/* Buttons */}
              {job.status === "pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => updateStatus(job._id, "accepted")}
                    disabled={loadingAction === job._id + "-accepted"}
                    className="flex-1 flex justify-center items-center bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-2 rounded-lg hover:scale-[1.03] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loadingAction === job._id + "-accepted" ? (
                      <>
                        <Spinner /> Processing...
                      </>
                    ) : (
                      "Accept"
                    )}
                  </button>
                  <button
                    onClick={() => updateStatus(job._id, "rejected")}
                    disabled={loadingAction === job._id + "-rejected"}
                    className="flex-1 flex justify-center items-center bg-gradient-to-r from-red-500 to-pink-600 text-white px-3 py-2 rounded-lg hover:scale-[1.03] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loadingAction === job._id + "-rejected" ? (
                      <>
                        <Spinner /> Processing...
                      </>
                    ) : (
                      "❌ Reject"
                    )}
                  </button>
                </div>
              )}

              {["accepted", "arrived"].includes(job.status) && (
                <>
                  <button
                    onClick={() => updateStatus(job._id, "completed")}
                    disabled={loadingAction === job._id + "-completed"}
                    className="w-full mt-2 flex justify-center items-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-2 rounded-lg hover:scale-[1.03] transition-all disabled:opacity-70"
                  >
                    {loadingAction === job._id + "-completed" ? (
                      <>
                        <Spinner /> Marking...
                      </>
                    ) : (
                      "🎉 Mark as Completed"
                    )}
                  </button>

                  {job.status === "accepted" && !job.liveSession?.active && (
                    <button
                      onClick={() => startTracking(job)}
                      disabled={loadingAction === job._id + "-track"}
                      className="w-full mt-2 flex justify-center items-center bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-3 py-2 rounded-lg hover:scale-[1.03] transition-all disabled:opacity-70"
                    >
                      {loadingAction === job._id + "-track" ? (
                        <>
                          <Spinner /> Starting...
                        </>
                      ) : (
                        "🚗 Start Live Tracking"
                      )}
                    </button>
                  )}

                  {job.status === "accepted" && job.liveSession?.active && (
                    <button
                      onClick={() => stopTracking(job)}
                      disabled={loadingAction === job._id + "-stop"}
                      className="w-full mt-2 flex justify-center items-center bg-gradient-to-r from-red-500 to-pink-600 text-white px-3 py-2 rounded-lg hover:scale-[1.03] transition-all disabled:opacity-70"
                    >
                      {loadingAction === job._id + "-stop" ? (
                        <>
                          <Spinner /> Stopping...
                        </>
                      ) : (
                        "🛑 Stop Live Tracking"
                      )}
                    </button>
                  )}

                  {job.status === "accepted" && (
                    <button
                      onClick={() => updateStatus(job._id, "arrived")}
                      disabled={loadingAction === job._id + "-arrived"}
                      className="w-full mt-2 flex justify-center items-center bg-gradient-to-r from-pink-500 to-rose-600 text-white px-3 py-2 rounded-lg hover:scale-[1.03] transition-all disabled:opacity-70"
                    >
                      {loadingAction === job._id + "-arrived" ? (
                        <>
                          <Spinner /> Updating...
                        </>
                      ) : (
                        "🏃 Mark as Arrived"
                      )}
                    </button>
                  )}
                </>
              )}

              {["accepted", "arrived"].includes(job.status) && (
                <button
                  onClick={() => setSelectedChatBooking(job)}
                  className="mt-3 w-full flex justify-center items-center bg-gradient-to-r from-sky-500 to-purple-500 text-white px-3 py-2 rounded-lg hover:scale-[1.03] transition-all"
                >
                  💬 Chat with {job.client?.name || "Client"}
                </button>
              )}
            </div>

            {/* Reviews Section */}
            {job.status === "completed" && (
              <div className="mt-4 border-t pt-3 w-full">
                <h4 className="font-semibold text-gray-800 mb-2 text-sm">
                  Client Reviews:
                </h4>
                {reviewsMap[job._id]?.length > 0 ? (
                  reviewsMap[job._id].map((r) => (
                    <div
                      key={r._id}
                      className="text-xs text-gray-600 mb-2 bg-white/60 backdrop-blur-sm p-2 rounded-md shadow-sm"
                    >
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span
                            key={i}
                            className={
                              i < r.rating ? "text-yellow-400" : "text-gray-300"
                            }
                          >
                            ★
                          </span>
                        ))}
                        <span className="ml-1">{r.comment}</span>
                      </div>
                      <p className="text-gray-400 text-[10px] mt-1">
                        – {r.reviewer?.name || "Anonymous"}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic">
                    No review yet for this job
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedChatBooking && (
        <ChatWindow
          booking={selectedChatBooking}
          onClose={() => setSelectedChatBooking(null)}
        />
      )}
    </div>
  );
}
