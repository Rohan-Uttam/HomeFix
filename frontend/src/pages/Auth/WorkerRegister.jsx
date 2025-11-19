import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext.jsx";
import { isEmail, isStrongPassword } from "../../utils/validators.js";
import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import toast from "react-hot-toast";
import { getCurrentLocation } from "../../utils/geocode.js";
import api from "../../api/axios.js";

export default function WorkerRegister() {
  const { register } = useAppContext();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [subcats, setSubcats] = useState([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "worker",
    phone: "",
    category: "",
    subcategory: "",
    skills: "",
    hourlyRate: "",
    rateType: "hourly",
    experience: "",
    bio: "",
    availability: "flexible",
    location: { lat: null, lng: null, address: "" },
  });

  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(false);

  // 📌 Fetch categories
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/categories");
        setCategories(res.data.data || []);
      } catch (err) {
        console.error("Categories fetch failed:", err);
        toast.error("Failed to load categories");
      }
    })();
  }, []);

  // 📌 Update subcategories
  useEffect(() => {
    const cat = categories.find((c) => c.key === form.category);
    setSubcats(cat ? cat.subcategories : []);
    setForm((prev) => ({ ...prev, subcategory: "" }));
  }, [form.category, categories]);

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
        location: {
          lat: loc.lat,
          lng: loc.lng,
          address: loc.address,
        },
      }));
      toast.success("📍 Current location captured!");
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
      return toast.error("Password must be 6+ chars, include number & special char");
    if (!/^[0-9]{10}$/.test(form.phone))
      return toast.error("Phone number must be exactly 10 digits");

    if (!form.hourlyRate || Number(form.hourlyRate) < 50)
      return toast.error("Rate must be at least ₹50");
    if (!form.experience && form.experience !== 0)
      return toast.error("Experience is required (put 0 if none)");
    if (!form.location.address)
      return toast.error("Address / Location is required");

    try {
      setLoading(true);

      const payload = {
        ...form,
        skills: form.skills
          ? form.skills.split(",").map((s) => s.trim())
          : [form.subcategory],
        hourlyRate: Number(form.hourlyRate),
        experience: Number(form.experience) || 0,
        rateType: form.rateType,
        location: form.location?.address
          ? {
              type: "Point",
              coordinates: [form.location.lng || 0, form.location.lat || 0],
              address: String(form.location.address || ""),
            }
          : undefined,
      };

      const fd = new FormData();
      Object.keys(payload).forEach((key) => {
        if (key === "location") {
          fd.append("location", JSON.stringify(payload.location));
        } else {
          fd.append(key, payload[key]);
        }
      });
      if (avatar) fd.append("profileImage", avatar);

      const result = await register(fd, true);

      if (result?.email || result?.phone) {
        toast.success(`🎉 OTP sent to ${result.phone}`);
        navigate("/verify-otp", {
          state: { email: result.email, phone: result.phone },
        });
      }
    } catch (err) {
      console.error("Worker Register error:", err);
      toast.error(err?.message || err?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-50 via-indigo-50 to-purple-50 px-4">
      <Card className="w-full max-w-2xl p-8 shadow-2xl border border-gray-100">
        <h2 className="text-3xl font-extrabold text-center mb-8 bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
          👷 Worker Registration
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 📸 Profile Photo Upload */}
          <div className="flex flex-col items-center">
            <label className="cursor-pointer">
              <div className="w-28 h-28 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-sky-500 transition">
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-28 h-28 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400 text-sm">Choose Photo</span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            <p className="mt-2 text-xs text-gray-500">Click above to upload</p>
          </div>

          {/* Name + Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              className="input"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="input"
            />
          </div>

          {/* Password + Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="input"
            />
            <input
              type="text"
              name="phone"
              placeholder="Phone (10 digits)"
              value={form.phone}
              onChange={handleChange}
              className="input"
            />
          </div>

          {/* Category + Subcategory */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="input"
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>
            <select
              name="subcategory"
              value={form.subcategory}
              onChange={handleChange}
              className="input"
            >
              <option value="">Select Subcategory</option>
              {subcats.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Address */}
          <input
            type="text"
            placeholder="Workshop / Shop Address"
            value={form.location.address}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                location: { ...prev.location, address: e.target.value },
              }))
            }
            className="input"
          />

          <Button
            type="button"
            onClick={handleGetLocation}
            variant="secondary"
            className="w-full py-2 text-sm font-medium hover:scale-[1.01] transition-transform"
            disabled={locLoading}
          >
            {locLoading ? "⏳ Fetching location..." : "📍 Use Current Location"}
          </Button>

          {/* Skills */}
          <input
            type="text"
            name="skills"
            placeholder="Extra Skills (comma separated)"
            value={form.skills}
            onChange={handleChange}
            className="input"
          />

          {/* Rate + Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="number"
              name="hourlyRate"
              placeholder="Rate (₹)"
              value={form.hourlyRate}
              onChange={handleChange}
              className="input"
            />
            <select
              name="rateType"
              value={form.rateType}
              onChange={handleChange}
              className="input"
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          {/* Experience + Bio */}
          <input
            type="number"
            name="experience"
            placeholder="Experience (years)"
            value={form.experience}
            onChange={handleChange}
            className="input"
          />
          <textarea
            name="bio"
            placeholder="Short bio"
            value={form.bio}
            onChange={handleChange}
            rows={3}
            className="input"
          ></textarea>

          {/* Availability */}
          <select
            name="availability"
            value={form.availability}
            onChange={handleChange}
            className="input"
          >
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="weekends">Weekends</option>
            <option value="flexible">Flexible</option>
          </select>

          {/* Submit */}
          <Button
            type="submit"
            variant="primary"
            className="w-full py-2 text-sm font-semibold shadow-md hover:scale-105 transition-transform"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register as Worker"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
