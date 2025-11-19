import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button.jsx";
import { bookingApi } from "../../api/bookingApi.js";
import { Briefcase, IndianRupee, MapPin, Layers } from "lucide-react";

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const worker = location.state?.worker;

  const [notes, setNotes] = useState("");
  const [price, setPrice] = useState(worker?.hourlyRate || 0);
  const [loading, setLoading] = useState(false);

  const rateLabels = { hourly: "hour", daily: "day", monthly: "month" };

  const handleBooking = async () => {
    setLoading(true);
    try {
      const bookingRes = await bookingApi.createBooking({
        workerId: worker._id,
        price,
        notes,
      });

      if (!bookingRes.data?.success) {
        toast.error("Booking creation failed");
        return;
      }

      toast.success("🎉 Booking created! Waiting for worker response.");
      navigate("/client/bookings");
    } catch (err) {
      console.error("Booking error:", err);
      toast.error("Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-sky-50 to-purple-100 px-4 py-16">
      {/* 🌈 Top Wave Gradient */}
      <div className="absolute top-0 left-0 right-0 overflow-hidden leading-[0]">
        <svg
          className="relative block w-full h-24 sm:h-36"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          viewBox="0 0 1200 120"
        >
          <path
            d="M0,0V46.29c47.79,22,106,32.53,166,32.53,168,0,289-61,457-61S891,91.82,1059,91.82c60,0,118.21-10.52,166-32.53V0Z"
            opacity=".25"
            className="fill-sky-500"
          ></path>
          <path
            d="M0,0V15.81C47.79,37.8,106,53.09,166,53.09c168,0,289-45,457-45S891,91.82,1059,91.82c60,0,118.21-10.52,166-32.53V0Z"
            opacity=".5"
            className="fill-indigo-500"
          ></path>
          <path
            d="M0,0V5.63C47.79,27.62,106,45,166,45c168,0,289-25,457-25S891,91.82,1059,91.82c60,0,118.21-10.52,166-32.53V0Z"
            className="fill-purple-500"
          ></path>
        </svg>
      </div>

      {/* 🌟 Checkout Card */}
      <div
        className="relative z-10 w-full max-w-md bg-gradient-to-br from-white/90 via-indigo-50/90 to-sky-50/90 
        backdrop-blur-2xl rounded-3xl shadow-[0_8px_35px_rgba(0,0,0,0.12)] border border-white/60 
        px-8 py-10 transition-all duration-500 hover:shadow-[0_15px_45px_rgba(99,102,241,0.25)]"
      >
        <h2 className="text-3xl font-extrabold mb-6 text-center bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-500 bg-clip-text text-transparent">
          Booking Summary
        </h2>

        {/* 👤 Worker Avatar */}
        <div className="flex justify-center mb-6 relative">
          <div className="absolute inset-0 flex justify-center">
            <div className="w-[110px] h-[110px] rounded-full bg-gradient-conic from-indigo-500 via-sky-400 to-cyan-400 blur-[3px] opacity-70 animate-spin-slow"></div>
          </div>
          <div className="relative w-[100px] h-[100px] rounded-full bg-gradient-to-br from-white to-slate-50 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.3)]">
            <img
              src={
                worker?.profileImage ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  worker?.user?.name || "Worker"
                )}&background=0ea5e9&color=fff&bold=true`
              }
              alt={worker?.user?.name}
              className="w-[88px] h-[88px] rounded-full object-cover border-2 border-white shadow-lg"
            />
          </div>
        </div>

        {/* 🧾 Worker Details */}
        <div className="text-gray-700 text-sm space-y-3 mb-6">
          <p className="flex items-center gap-2">
            👷 <span className="font-semibold text-gray-800">Worker:</span>{" "}
            {worker?.user?.name || worker?.name}
          </p>
          <p className="flex items-center gap-2">
            🏷 <span className="font-semibold text-gray-800">Category:</span>{" "}
            {worker?.category || "N/A"}{" "}
            {worker?.subcategory && (
              <span className="text-indigo-600">• {worker.subcategory}</span>
            )}
          </p>
          <p className="flex items-center gap-2">
            <Briefcase size={15} className="text-sky-500" />
            <span className="font-semibold text-gray-800">
              Experience:
            </span>{" "}
            {worker?.experience || 0} years
          </p>
          <p className="flex items-center gap-2">
            <IndianRupee size={15} className="text-indigo-500" />
            <span className="font-semibold text-gray-800">Rate:</span> ₹
            {worker?.hourlyRate} / {rateLabels[worker?.rateType]}
          </p>
          <p className="flex items-center gap-2">
            <MapPin size={15} className="text-pink-500" />
            <span className="font-semibold text-gray-800">Location:</span>{" "}
            {worker?.location?.address || "Not Provided"}
          </p>
          {worker?.skills?.length > 0 && (
            <p className="flex items-center gap-2">
              <Layers size={15} className="text-teal-500" />
              <span className="font-semibold text-gray-800">Skills:</span>{" "}
              <span className="text-indigo-600 font-medium">
                {worker.skills.slice(0, 3).join(", ")}
              </span>
            </p>
          )}
        </div>

        {/* ✏️ Notes & Price */}
        <div className="space-y-3 mb-6">
          <textarea
            placeholder="Add notes for this booking..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border rounded-xl px-3 py-2 text-sm shadow-sm bg-white/80 
            focus:ring-2 focus:ring-sky-400 focus:outline-none resize-none transition-all"
          />
          <input
            type="number"
            placeholder="Enter final price"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="w-full border rounded-xl px-3 py-2 text-sm shadow-sm bg-white/80 
            focus:ring-2 focus:ring-sky-400 focus:outline-none"
          />
        </div>

        {/* 🚀 Confirm Button */}
        <Button
          onClick={handleBooking}
          disabled={loading}
          variant="primary"
          className="w-full py-3 text-sm font-semibold rounded-full bg-gradient-to-r 
          from-indigo-600 via-sky-500 to-cyan-400 text-white shadow-[0_5px_25px_rgba(56,189,248,0.45)]
          hover:scale-[1.05] hover:shadow-[0_8px_30px_rgba(99,102,241,0.4)]
          transition-all duration-300 ease-in-out"
        >
          {loading ? "⏳ Processing..." : "Confirm Booking"}
        </Button>
      </div>
    </div>
  );
}

/* ✨ Animations */
<style jsx>{`
  .animate-spin-slow {
    animation: spin 5s linear infinite;
  }
`}</style>
