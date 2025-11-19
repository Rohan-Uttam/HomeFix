import { useEffect, useState } from "react";
import { bookingApi } from "../../api/bookingApi.js";
import toast from "react-hot-toast";
import AddReview from "../Reviews/AddReview.jsx";
import ChatWindow from "../../components/ChatWindow.jsx";
import LiveMap from "../../components/LiveMap.jsx";
import Card from "../../components/ui/Card.jsx";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const res = await bookingApi.getClientBookings();
        setBookings(res.data?.data || []);
      } catch (err) {
        console.error("❌ Failed to load bookings:", err);
        toast.error("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const getAvatar = (worker) => {
    const candidates = [
      worker?.avatar,
      worker?.profileImage,
      worker?.user?.avatar,
    ];
    const valid = candidates.find((x) => x && x.trim() !== "");
    if (valid) return valid;
    const name = worker?.user?.name || "Worker";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=0ea5e9&color=fff`;
  };

  const getCategory = (worker) => {
    if (!worker) return "N/A";
    if (worker.category?.toLowerCase() === "other") {
      return worker.customCategory || "Other";
    }
    return worker.category || "N/A";
  };

  if (loading)
    return (
      <p className="text-center mt-10 text-gray-600 animate-pulse">
        ⏳ Loading your bookings...
      </p>
    );

  if (!bookings.length)
    return (
      <p className="text-center mt-10 text-gray-500 font-medium">
        You have no bookings yet.
      </p>
    );

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-sky-50 via-indigo-50 to-purple-100 py-14 px-5">
      <div className="absolute top-0 left-0 right-0 overflow-hidden leading-[0]">
        <svg
          className="relative block w-full h-20 sm:h-32"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          viewBox="0 0 1200 120"
        >
          <path
            d="M0,0V46.29c47.79,22,106,32.53,166,32.53,
              168,0,289-61,457-61S891,91.82,1059,91.82,
              c60,0,118.21-10.52,166-32.53V0Z"
            opacity=".25"
            className="fill-sky-500"
          />
          <path
            d="M0,0V15.81C47.79,37.8,106,53.09,166,53.09,
              c168,0,289-45,457-45S891,91.82,1059,91.82,
              c60,0,118.21-10.52,166-32.53V0Z"
            opacity=".5"
            className="fill-purple-500"
          />
          <path
            d="M0,0V5.63C47.79,27.62,106,45,166,45,
              c168,0,289-25,457-25S891,91.82,1059,91.82,
              c60,0,118.21-10.52,166-32.53V0Z"
            className="fill-indigo-500"
          />
        </svg>
      </div>

      <h2 className="text-4xl font-extrabold mb-14 text-center bg-gradient-to-r from-sky-500 via-purple-500 to-indigo-600 bg-clip-text text-transparent drop-shadow-lg">
        📋 My Bookings
      </h2>

      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 justify-center relative z-10">
        {bookings.map((b) => (
          <Card
            key={b._id}
            className="relative flex flex-col justify-between items-center p-6 rounded-3xl 
            bg-gradient-to-br from-white/90 via-sky-50/90 to-indigo-50/90 
            backdrop-blur-xl border border-white/50 
            shadow-[0_8px_30px_rgba(0,0,0,0.08)] 
            hover:shadow-[0_15px_45px_rgba(79,70,229,0.25)] hover:-translate-y-3 hover:scale-[1.02]
            transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-indigo-500 via-sky-500 to-purple-500 rounded-t-3xl"></div>

            <div className="mt-3">
              <img
                src={getAvatar(b.worker)}
                alt={b.worker?.user?.name || "Worker"}
                className="w-[80px] h-[80px] rounded-full object-cover border-2 border-white shadow-lg"
              />
            </div>

            <h3 className="mt-3 text-[16px] font-semibold text-gray-900 capitalize text-center tracking-tight">
              {b.worker?.user?.name || "Unnamed Worker"}
            </h3>

            <p className="text-[13px] text-gray-600 text-center">
              <span className="font-semibold">Category:</span>{" "}
              {getCategory(b.worker)}
              {b.worker?.subcategory &&
                b.worker?.category?.toLowerCase() !== "other" &&
                ` • ${b.worker.subcategory}`}
            </p>

            <p className="text-[13px] text-gray-600 text-center">
              <span className="font-semibold">Skills:</span>{" "}
              {b.service?.skills?.join(", ") || "N/A"}
            </p>

            <p className="text-[13px] text-gray-600 text-center">
              <span className="font-semibold">Experience:</span>{" "}
              {b.worker?.experience || 0} years
            </p>

            <p className="text-[13px] text-gray-600 text-center mt-1">
              <span className="font-semibold">Rate:</span>{" "}
              <span className="bg-gradient-to-r from-sky-500 to-indigo-600 text-white px-2 py-[2px] rounded-md text-[11px] font-semibold shadow-sm">
                ₹{b.worker?.hourlyRate || "N/A"} / {b.worker?.rateType || "hour"}
              </span>
            </p>

            {b.worker?.rating > 0 && (
              <p className="text-xs text-yellow-500 mt-1 font-medium">
                ⭐ {b.worker.rating} ({b.worker.totalReviews || 0} reviews)
              </p>
            )}

            {/* Status Section */}
            <div className="w-full mt-4 border-t border-gray-200 pt-3 text-center text-[12px]">
              <p>
                <span className="font-semibold">Status:</span>{" "}
                <span
                  className={`px-2 py-[3px] rounded-full text-white text-xs shadow-sm capitalize
                    ${
                      b.status === "pending"
                        ? "bg-gradient-to-r from-amber-500 to-orange-600"
                        : b.status === "accepted"
                        ? "bg-gradient-to-r from-green-500 to-emerald-600"
                        : b.status === "arrived"
                        ? "bg-gradient-to-r from-purple-500 to-indigo-600"
                        : b.status === "rejected"
                        ? "bg-gradient-to-r from-red-500 to-pink-600"
                        : b.status === "completed"
                        ? "bg-gradient-to-r from-sky-500 to-cyan-600"
                        : "bg-gray-400"
                    }`}
                >
                  {b.status}
                </span>
              </p>
              <p>
                <span className="font-semibold">Price:</span> ₹{b.price}
              </p>

              {/* 💰 Payment Completed Badge */}
              {b.status === "completed" && b.paymentStatus === "paid" && (
                <p className="mt-1 text-[13px] font-semibold text-green-600 bg-green-50 border border-green-200 rounded-md px-3 py-1 inline-block shadow-sm">
                  💰 Payment Completed
                </p>
              )}

              <p className="text-[11px] text-gray-500">
                📅 {new Date(b.createdAt).toLocaleString()}
              </p>
            </div>

            {/* 💬 ACTION BUTTONS */}
            <div className="mt-3 w-full space-y-2">
              {["accepted", "arrived"].includes(b.status) && (
                <button
                  onClick={() => setSelectedBooking({ ...b, chat: true })}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-2 rounded-md 
                             text-[13px] font-medium shadow hover:scale-[1.03] hover:brightness-110 transition-all"
                >
                  💬 Chat with {b.worker?.user?.name || "Worker"}
                </button>
              )}

              {b.liveSession?.active && b.status !== "arrived" && (
                <button
                  onClick={() => setSelectedBooking({ ...b, track: true })}
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-3 py-2 rounded-md 
                             text-[13px] font-medium shadow hover:scale-[1.03] hover:brightness-110 transition-all"
                >
                  📍 Track Worker
                </button>
              )}

              {b.status === "completed" &&
                !b.reviewed &&
                b.paymentStatus === "pending" && (
                  <button
                    onClick={() => setSelectedBooking({ ...b, review: true })}
                    className="w-full bg-gradient-to-r from-sky-500 to-purple-500 text-white px-3 py-2 rounded-md 
                               text-[13px] font-medium shadow hover:scale-[1.03] hover:brightness-110 transition-all"
                  >
                    ✍️ Add Review & Pay
                  </button>
                )}

              {b.status === "completed" && b.paymentStatus === "failed" && (
                <button
                  onClick={() => setSelectedBooking({ ...b, retry: true })}
                  className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white px-3 py-2 rounded-md 
                             text-[13px] font-medium shadow hover:scale-[1.03] hover:brightness-110 transition-all"
                >
                  🔄 Retry Payment
                </button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {selectedBooking?.review && (
        <AddReview
          bookingId={selectedBooking._id}
          workerId={selectedBooking.worker._id}
          price={selectedBooking.price}
          onClose={() => setSelectedBooking(null)}
          onSuccess={(review) => {
            setBookings((prev) =>
              prev.map((bk) =>
                bk._id === selectedBooking._id
                  ? {
                      ...bk,
                      reviewed: true,
                      paymentStatus: "paid",
                      worker: {
                        ...bk.worker,
                        rating: review?.workerRating ?? bk.worker.rating,
                        totalReviews:
                          review?.workerTotalReviews ?? bk.worker.totalReviews,
                      },
                    }
                  : bk
              )
            );
            setSelectedBooking(null);
          }}
        />
      )}

      {selectedBooking?.chat && (
        <ChatWindow
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}

      {selectedBooking?.track && (
        <LiveMap
          sessionId={selectedBooking.liveSession.sessionId}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
}
