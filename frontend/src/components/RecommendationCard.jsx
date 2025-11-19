import { motion } from "framer-motion";

export default function RecommendationCard({ worker }) {
  // category display logic
  const displayCategory =
    worker.category?.toLowerCase() === "other"
      ? `Other - ${worker.customCategory || "N/A"}`
      : worker.category || "N/A";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.02, boxShadow: "0px 12px 24px rgba(0,0,0,0.1)" }}
      className="bg-white border rounded-xl p-5 shadow-sm 
                 hover:shadow-lg transition-all duration-500 ease-in-out
                 hover:bg-gradient-to-br hover:from-sky-50 hover:to-indigo-50
                 flex flex-col justify-between min-h-[220px]"
    >
      {/* Worker Header */}
      <div className="flex items-center gap-3">
        <img
          src={
            worker.avatar ||
            worker.profileImage ||
            "https://cdn-icons-png.flaticon.com/512/149/149071.png"
          }
          alt={worker.name}
          className="w-12 h-12 rounded-full border-2 border-sky-400 shadow-sm object-cover"
        />
        <div>
          <h3 className="font-semibold text-gray-800 text-sm">
            {worker.name}
          </h3>
          <p className="text-xs text-gray-500 capitalize">
            {displayCategory}
          </p>
        </div>
      </div>

      {/* Worker Info */}
      <div className="mt-3 text-xs space-y-1 text-gray-600">
        <p className="flex items-center gap-1">
          <span className="text-yellow-500">⭐</span>
          {worker.rating || 0} ({worker.totalReviews || 0} reviews)
        </p>
        {worker.distanceKm && <p>📍 {worker.distanceKm} km away</p>}
        {worker.skills?.length > 0 && (
          <p className="italic text-gray-500">
            Skills:{" "}
            <span className="text-sky-600 font-medium">
              {worker.skills.slice(0, 3).join(", ")}
            </span>
          </p>
        )}
      </div>

      {/* CTA */}
      <button
        className="mt-4 w-full py-2 rounded-lg 
                   bg-gradient-to-r from-sky-500 to-indigo-600 text-white 
                   text-sm font-semibold shadow-md
                   hover:scale-[1.03] hover:shadow-lg transition-all duration-300"
      >
        🚀 Book Now
      </button>
    </motion.div>
  );
}
