import { useNavigate } from "react-router-dom";
import { Briefcase, MapPin, IndianRupee } from "lucide-react";

export default function WorkerCard({ worker, showLocation = false }) {
  const navigate = useNavigate();

  const rateLabels = { hourly: "hour", daily: "day", monthly: "month" };

  const getAvatar = () => {
    const img =
      worker.profileImage || worker.user?.avatar || worker.avatar || "";
    if (img?.startsWith("http")) return img;
    if (img)
      return `${
        import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
      }${img}`;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      worker.user?.name || worker.name || "Worker"
    )}&background=0ea5e9&color=fff&bold=true`;
  };

  const handleHireNow = () => {
    // ✅ Properly passing worker object inside state
    navigate("/checkout", { state: { worker } });
  };

  const isOther =
    worker.category?.toLowerCase() === "other" && worker.customCategory;
  const displayCategory = isOther
    ? worker.customCategory
    : worker.category || "Category";
  const displaySubcategory =
    !isOther && worker.subcategory ? worker.subcategory : "";

  const filteredSkills =
    worker.skills?.filter(
      (s) => s?.toLowerCase() !== worker.customCategory?.toLowerCase()
    ) || [];

  return (
    <div
      className="group relative flex flex-col justify-between items-center p-6 rounded-3xl 
      bg-gradient-to-br from-white/90 via-sky-50/90 to-indigo-50/90 
      backdrop-blur-lg border border-white/50 shadow-[0_8px_30px_rgba(0,0,0,0.08)]
      hover:shadow-[0_15px_45px_rgba(79,70,229,0.25)] hover:-translate-y-3 hover:scale-[1.02]
      transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden min-h-[370px] w-[290px]"
    >
      {/* 🏅 Available Badge */}
      <div className="absolute top-3 right-3 px-3 py-[3px] bg-gradient-to-r from-emerald-500 to-teal-400 
        text-white text-[10px] font-semibold rounded-full shadow-md 
        flex items-center gap-1 animate-pulse">
        <span className="w-2 h-2 bg-white rounded-full animate-ping"></span> Available Now
      </div>

      {/* 🧑 Avatar */}
      <div className="relative mt-2">
        <div className="absolute inset-0 rounded-full bg-gradient-conic from-indigo-500 via-sky-400 to-cyan-400 
        blur-[3px] opacity-80 group-hover:opacity-100 animate-spin-slow"></div>

        <div className="relative w-[92px] h-[92px] rounded-full flex items-center justify-center 
        bg-gradient-to-br from-white to-slate-50 shadow-[0_0_15px_rgba(56,189,248,0.3)]">
          <img
            src={getAvatar()}
            alt={worker.user?.name || worker.name || "Worker"}
            className="w-20 h-20 rounded-full object-cover border-[2.5px] border-white shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
          />
        </div>
      </div>

      <h3 className="mt-3 text-[16px] font-semibold text-gray-900 capitalize text-center tracking-tight">
        {worker.user?.name || worker.name || "Unnamed Worker"}
      </h3>

      <div className="text-center mt-1 space-y-1">
        {isOther ? (
          <div className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-indigo-600 via-sky-500 to-cyan-400 
            text-white text-[11px] font-medium shadow-[0_2px_6px_rgba(56,189,248,0.3)] capitalize">
            {displayCategory}
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-500">
              {displayCategory}
              {displaySubcategory && ` • ${displaySubcategory}`}
            </p>
            {displaySubcategory && (
              <div className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 
                text-white text-[11px] font-medium shadow-sm capitalize">
                {displaySubcategory}
              </div>
            )}
          </>
        )}
      </div>

      <div className="text-[13px] text-gray-700 space-y-2 mt-3 text-center">
        <p className="flex items-center justify-center gap-1">
          <Briefcase size={14} className="text-sky-500" />
          <span className="font-medium text-gray-800">
            {worker.experience || 0} yrs experience
          </span>
        </p>
        <p className="flex items-center justify-center gap-1">
          <IndianRupee size={14} className="text-indigo-500" />
          <span className="font-semibold text-gray-800">
            ₹{worker.hourlyRate || "N/A"} /{" "}
            {rateLabels[worker.rateType] || worker.rateType}
          </span>
        </p>
        {showLocation && worker.location?.address && (
          <p className="flex items-center justify-center gap-1 text-gray-600 text-[12px]">
            <MapPin size={12} className="text-pink-500" />
            <span className="line-clamp-1">{worker.location.address}</span>
          </p>
        )}
      </div>

      <div className="mt-4 flex justify-center">
        <button
          onClick={handleHireNow}
          className="px-8 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 via-sky-500 to-cyan-400 
          text-white text-sm font-semibold shadow-[0_4px_20px_rgba(99,102,241,0.4)]
          hover:shadow-[0_6px_25px_rgba(56,189,248,0.5)] hover:from-indigo-700 hover:to-sky-600
          hover:scale-[1.07] active:scale-[0.97] transition-all duration-300 ease-in-out
          flex items-center gap-2"
        >
          🚀 Hire Now
        </button>
      </div>
    </div>
  );
}

/* ✨ Extra Tailwind animations */
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
    animation: spin 5s linear infinite;
  }
`}</style>
