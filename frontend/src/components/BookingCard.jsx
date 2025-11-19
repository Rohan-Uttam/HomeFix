import Button from "./ui/Button.jsx";

export default function BookingCard({ booking, onAction }) {
  const worker = booking.worker || {};
  const user = worker.user || {};

  const getAvatar = () => {
    const img = worker.profileImage;
    if (img?.startsWith("http")) return img;
    return (
      img ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        user?.name || "Worker"
      )}&background=0ea5e9&color=fff&bold=true`
    );
  };

  return (
    <div
      className="relative bg-gradient-to-br from-white/90 via-indigo-50/90 to-sky-50/90 
      backdrop-blur-xl border border-white/60 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.08)]
      hover:shadow-[0_15px_45px_rgba(56,189,248,0.3)] hover:-translate-y-2 hover:scale-[1.02]
      transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] p-6 flex flex-col items-center
      overflow-hidden min-h-[340px] w-full max-w-[320px] mx-auto"
    >
      {/* 🌈 Gradient Shine */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 blur-md animate-[shine_2.5s_linear_infinite]"></div>

      {/* 👤 Worker Image */}
      <div className="relative mt-2">
        <div className="absolute inset-0 rounded-full bg-gradient-conic from-indigo-500 via-sky-400 to-cyan-400 blur-[3px] opacity-70 animate-spin-slow"></div>
        <div className="relative w-[88px] h-[88px] rounded-full flex items-center justify-center 
        bg-gradient-to-br from-white to-slate-50 shadow-[0_0_15px_rgba(56,189,248,0.3)]">
          <img
            src={getAvatar()}
            alt={user?.name || "Worker"}
            className="w-[76px] h-[76px] rounded-full object-cover border-[2.5px] border-white shadow-md"
          />
        </div>
      </div>

      {/* 👨‍🔧 Worker Details */}
      <h3 className="mt-3 text-[16px] font-semibold text-gray-900 capitalize text-center tracking-tight">
        {user?.name || "Unnamed Worker"}
      </h3>

      <p className="text-sm text-gray-600 mt-1">
        <span className="font-semibold text-gray-700">Skills:</span>{" "}
        <span className="text-indigo-600 font-medium">
          {worker.skills?.join(", ") || "N/A"}
        </span>
      </p>

      <p className="text-sm text-gray-600">
        <span className="font-semibold text-gray-700">Experience:</span>{" "}
        {worker.experience || 0} years
      </p>

      <p className="text-sm mt-1">
        <span className="font-semibold text-gray-700">Rate:</span>{" "}
        <span className="bg-gradient-to-r from-sky-500 to-indigo-600 text-white px-2 py-[2px] rounded-md text-[11px] font-semibold shadow-sm">
          ₹{worker.hourlyRate || "N/A"} / {worker.rateType || "hourly"}
        </span>
      </p>

      {/* 🌟 Divider Line */}
      <div className="w-16 h-[2px] bg-gradient-to-r from-sky-400 to-indigo-500 mt-4 rounded-full"></div>

      {/* 📋 Booking Details */}
      <div className="mt-4 text-sm text-gray-700 space-y-1 text-center">
        <p>
          <span className="font-semibold">Status:</span>{" "}
          <span
            className={`px-2 py-[3px] rounded-full text-white text-xs shadow-sm capitalize
              ${
                booking.status === "pending"
                  ? "bg-amber-500"
                  : booking.status === "accepted"
                  ? "bg-green-500"
                  : booking.status === "completed"
                  ? "bg-sky-600"
                  : booking.status === "rejected"
                  ? "bg-rose-500"
                  : "bg-gray-400"
              }`}
          >
            {booking.status}
          </span>
        </p>

        <p>
          <span className="font-semibold">Price:</span>{" "}
          <span className="text-sky-700 font-semibold">₹{booking.price}</span>
        </p>

        {booking.notes && (
          <p className="italic text-gray-500 text-[13px] mt-1">
            “{booking.notes.length > 70
              ? booking.notes.slice(0, 70) + "..."
              : booking.notes}”
          </p>
        )}

        <p className="text-xs text-gray-500 mt-1">
          📅 {new Date(booking.createdAt).toLocaleString()}
        </p>
      </div>

      {/* ⭐ Ratings */}
      {booking.worker?.rating ? (
        <p className="text-[13px] text-yellow-500 mt-2 font-medium">
          ⭐ {booking.worker.rating}{" "}
          <span className="text-gray-500 text-xs">
            ({booking.worker.totalReviews || 0} reviews)
          </span>
        </p>
      ) : null}

      {/* ✅ Action Buttons */}
      {onAction && booking.status === "pending" && (
        <div className="mt-5 flex justify-center gap-3">
          <Button
            variant="primary"
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 text-sm rounded-full font-semibold shadow-md hover:scale-[1.05] hover:shadow-[0_4px_15px_rgba(34,197,94,0.4)] transition-all"
            onClick={() => onAction(booking._id, "accepted")}
          >
            ✅ Accept
          </Button>

          <Button
            variant="danger"
            className="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-4 py-2 text-sm rounded-full font-semibold shadow-md hover:scale-[1.05] hover:shadow-[0_4px_15px_rgba(244,63,94,0.4)] transition-all"
            onClick={() => onAction(booking._id, "rejected")}
          >
            ❌ Reject
          </Button>
        </div>
      )}
    </div>
  );
}

/* ✨ Animations */
<style jsx>{`
  @keyframes shine {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(200%);
    }
  }
  .animate-spin-slow {
    animation: spin 6s linear infinite;
  }
`}</style>
