import { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext.jsx";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import toast from "react-hot-toast";
import api from "../../api/axios.js";
import { getCurrentLocation } from "../../utils/geocode.js";

export default function WorkerProfile() {
  const { user, setUser } = useAppContext();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [subcats, setSubcats] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    category: "",
    customCategory: "",
    subcategory: "",
    skills: "",
    hourlyRate: "",
    rateType: "hourly",
    experience: "",
    bio: "",
    availability: "flexible",
    location: { lat: 0, lng: 0, address: "" },
  });

  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(false);

  // Fetch categories
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/categories");
        const cats = res.data.data || [];
        setCategories([...cats, { key: "other", label: "Other", subcategories: [] }]);
      } catch {
        toast.error("⚠️ Failed to load categories");
      }
    })();
  }, []);

  // Prefill data
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        category: user.category || "",
        customCategory: user.customCategory || "",
        subcategory: user.subcategory || "",
        skills: user.skills ? user.skills.join(", ") : "",
        hourlyRate: user.hourlyRate || "",
        rateType: user.rateType || "hourly",
        experience: user.experience || "",
        bio: user.bio || "",
        availability: user.availability || "flexible",
        location: user.location || { lat: 0, lng: 0, address: "" },
      });
      if (user.avatar) setPreview(user.avatar);
      else if (user.profileImage) setPreview(user.profileImage);
    }
  }, [user]);

  useEffect(() => {
    if (form.category === "other") {
      setSubcats([]);
      setForm((p) => ({ ...p, subcategory: "" }));
    } else {
      const cat = categories.find((c) => c.key === form.category);
      setSubcats(cat ? cat.subcategories : []);
      setForm((p) => ({ ...p, subcategory: "" }));
    }
  }, [form.category, categories]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
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
      setForm((p) => ({
        ...p,
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
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("phone", form.phone);
      fd.append("category", form.category);
      if (form.category?.toLowerCase() === "other" && form.customCategory.trim()) {
        fd.append("customCategory", form.customCategory.trim());
      } else {
        fd.append("customCategory", "");
      }
      fd.append("subcategory", form.subcategory);
      fd.append("skills", form.skills);
      fd.append("hourlyRate", form.hourlyRate);
      fd.append("rateType", form.rateType);
      fd.append("experience", form.experience);
      fd.append("bio", form.bio);
      fd.append("availability", form.availability);
      fd.append(
        "location",
        JSON.stringify({
          lat: form.location.lat ?? 0,
          lng: form.location.lng ?? 0,
          address: form.location.address || "Not Provided",
        })
      );
      if (avatar) fd.append("avatar", avatar);

      const res = await api.put("/workers/profile", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const updated = res.data?.data;
      setUser(updated.user || updated);
      toast.success("Profile updated successfully!");
      navigate("/worker/dashboard");
    } catch (err) {
      console.error("Worker update error:", err);
      toast.error(err?.response?.data?.message || "Profile update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-50 via-purple-50 to-indigo-50 px-4">
      <Card className="w-full max-w-2xl p-6 shadow-2xl rounded-2xl border border-gray-100">
        <h2 className="text-3xl font-extrabold text-center mb-6 bg-gradient-to-r from-sky-500 via-purple-500 to-indigo-600 bg-clip-text text-transparent">
          👷 Update Worker Profile
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 📸 Avatar */}
          <div className="flex flex-col items-center">
            <label className="cursor-pointer">
              <div className="w-28 h-28 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-sky-400 transition">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Full Name"
              className="input"
            />
            <input
              type="email"
              name="email"
              value={form.email}
              disabled
              className="input bg-gray-100 cursor-not-allowed"
            />
          </div>

          {/* Phone */}
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone"
            className="input"
          />

          {/* Category + Subcategory */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

            {form.category === "other" ? (
              <input
                type="text"
                name="customCategory"
                value={form.customCategory}
                onChange={handleChange}
                placeholder="Enter Custom Category"
                className="input"
              />
            ) : (
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
            )}
          </div>

          {/* Address */}
          <input
            type="text"
            value={form.location.address}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                location: { ...p.location, address: e.target.value },
              }))
            }
            placeholder="Workshop / Shop Address"
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

          {/* Rate + RateType */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="number"
              name="hourlyRate"
              value={form.hourlyRate}
              onChange={handleChange}
              placeholder="Rate (₹)"
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
            value={form.experience}
            onChange={handleChange}
            placeholder="Experience (years)"
            className="input"
          />
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            placeholder="Short bio"
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

          <Button
            type="submit"
            variant="primary"
            className="w-full py-3 text-sm font-semibold shadow-md hover:scale-105 transition-transform bg-gradient-to-r from-sky-500 via-purple-500 to-indigo-600"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
