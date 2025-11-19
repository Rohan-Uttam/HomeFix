import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppContext } from "../../context/AppContext.jsx";
import toast from "react-hot-toast";
import api from "../../api/axios.js";

export default function VerifyOtp() {
  const { verifyOtp } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";
  const phone = location.state?.phone || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // ⏳ countdown
  useEffect(() => {
    if (timer > 0) {
      const t = setTimeout(() => setTimer((prev) => prev - 1), 1000);
      return () => clearTimeout(t);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  // ✅ Verify OTP
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Missing email, please re-register");
    if (!/^[0-9]{6}$/.test(otp)) return toast.error("Enter 6-digit OTP");

    try {
      setLoading(true);
      const result = await verifyOtp({ email, otp: otp.toString() });
      if (!result) throw new Error("Invalid server response");

      toast.success("OTP verified!");

      const role = result?.user?.role;
      if (role === "client") navigate("/");
      else if (role === "worker") navigate("/");
      else if (role === "admin") navigate("/admin/dashboard");
      else navigate("/");
    } catch (err) {
      console.error("Verify OTP error:", err);
      const backendMsg =
        err?.response?.data?.message ||
        err?.message ||
        "OTP verification failed";
      toast.error(backendMsg);
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Resend OTP
  const handleResend = async () => {
    try {
      setTimer(30);
      setCanResend(false);

      const payload = { email };
      if (phone) payload.phone = phone;

      const res = await api.post("/auth/resend-otp", payload);

      const usedPhone = res?.data?.data?.phone;
      if (usedPhone) {
        toast.success(`New OTP sent to ${usedPhone}`);
      } else {
        toast.success("New OTP sent (check your email)");
      }
    } catch (err) {
      console.error("Resend OTP error:", err);
      const backendMsg =
        err?.response?.data?.message || err?.message || "Failed to resend OTP";
      toast.error(backendMsg);
      setCanResend(true);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-500 via-purple-500 to-pink-500 px-4">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl p-8 rounded-2xl shadow-2xl">
        <h2 className="text-3xl font-extrabold text-center mb-4 bg-gradient-to-r from-sky-500 to-pink-500 bg-clip-text text-transparent">
          🔐 Verify OTP
        </h2>

        <p className="text-sm text-gray-600 mb-6 text-center">
          OTP sent to:{" "}
          <span className="font-semibold text-sky-600">
            {phone || email || "your email"}
          </span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            placeholder="Enter 6-digit OTP"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-500 text-center text-lg tracking-widest font-semibold"
            maxLength={6}
          />

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-gradient-to-r from-sky-500 to-pink-500 text-white font-bold shadow-lg hover:opacity-90 transition-all duration-300"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        {/* Resend Section */}
        <div className="mt-6 text-center">
          {canResend ? (
            <button
              onClick={handleResend}
              className="text-sky-600 font-semibold hover:underline hover:text-sky-800 transition"
            >
              🔄 Resend OTP
            </button>
          ) : (
            <p className="text-gray-600 text-sm">
              ⏳ Resend available in <span className="font-bold">{timer}s</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
