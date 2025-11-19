import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAppContext } from "../../context/AppContext.jsx";
import { isEmail, isStrongPassword } from "../../utils/validators.js";
import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import toast from "react-hot-toast";
import { getCurrentLocation } from "../../utils/geocode.js";

export default function Register() {
  const { register } = useAppContext();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "client",
    location: { lat: null, lng: null, address: "" },
  });

  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleGetLocation = async () => {
    if (locLoading) return;
    setLocLoading(true);
    try {
      const loc = await getCurrentLocation();
      setForm((prev) => ({
        ...prev,
        location: { lat: loc.lat, lng: loc.lng, address: loc.address },
      }));
      toast.success("📍 Location captured!");
    } catch (err) {
      toast.error(err.message || "Failed to fetch location");
    } finally {
      setLocLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) return toast.error("Name is required");
    if (!isEmail(form.email)) return toast.error("Invalid email");
    if (!isStrongPassword(form.password))
      return toast.error(
        "Password must be 6+ chars, include number & special char"
      );
    if (!/^[0-9]{10}$/.test(form.phone))
      return toast.error("Phone number must be exactly 10 digits");
    if (!form.location.address)
      return toast.error("Address / Location is required");

    try {
      setLoading(true);
      const fd = new FormData();
      Object.keys(form).forEach((key) => {
        if (key === "location") {
          fd.append("location", JSON.stringify(form.location));
        } else {
          fd.append(key, form[key]);
        }
      });
      if (avatar) fd.append("avatar", avatar);

      const result = await register(fd, true);

      if (result?.email || result?.phone) {
        toast.success(`🎉 OTP sent to ${result.phone || result.email}`);
        navigate("/verify-otp", {
          state: { email: result.email, phone: result.phone },
        });
      }
    } catch (err) {
      const backendMsg = err?.response?.data?.message;
      if (backendMsg === "User already exists") {
        toast.error("⚠️ This email is already registered. Please login instead.");
      } else {
        toast.error(backendMsg || "Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
 <div className="relative flex items-center justify-center min-h-screen 
                  bg-gradient-to-br from-sky-500 via-purple-500 to-pink-500 
                  px-4 overflow-hidden py-12">
    {/* Background Blobs */}
      <motion.div
        className="absolute -top-20 -left-20 w-72 h-72 bg-sky-400 rounded-full filter blur-3xl opacity-30"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-20 right-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-20"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Register Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-lg z-10"
      >
        <Card className="p-8 shadow-2xl border border-white/20 backdrop-blur-xl bg-white/80">
          <h2 className="text-3xl font-extrabold text-center bg-gradient-to-r from-sky-500 to-pink-500 bg-clip-text text-transparent mb-6">
            📝 Create Your Account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Profile Photo */}
            <div className="flex flex-col items-center">
              <label className="cursor-pointer">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="w-28 h-28 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-sky-400 transition"
                >
                  {preview ? (
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-28 h-28 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 text-sm">Choose Photo</span>
                  )}
                </motion.div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <p className="mt-2 text-xs text-gray-500">Click above to upload</p>
            </div>

            {/* Name */}
            <motion.input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="John Doe"
              whileFocus={{ scale: 1.02 }}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-500 transition"
              required
            />

            {/* Email */}
            <motion.input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              whileFocus={{ scale: 1.02 }}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-500 transition"
              required
            />

            {/* Password */}
            <motion.input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              whileFocus={{ scale: 1.02 }}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-500 transition"
              required
            />

            {/* Phone */}
            <motion.input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="9876543210"
              whileFocus={{ scale: 1.02 }}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-500 transition"
              required
            />

            {/* Address */}
            <motion.input
              type="text"
              placeholder="Enter your address"
              value={form.location.address}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  location: { ...prev.location, address: e.target.value },
                }))
              }
              whileFocus={{ scale: 1.02 }}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-500 transition"
              required
            />

            {/* Location Button */}
            <Button
              type="button"
              onClick={handleGetLocation}
              variant="secondary"
              className="w-full py-2 text-sm font-medium shadow hover:scale-[1.02] transition-transform"
              disabled={locLoading}
            >
              {locLoading ? "⏳ Fetching location..." : "📍 Use Current Location"}
            </Button>

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              className="w-full py-3 text-lg font-semibold shadow-lg bg-gradient-to-r from-sky-500 to-pink-500 text-white rounded-lg hover:opacity-90 hover:scale-[1.02] transition-transform"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
