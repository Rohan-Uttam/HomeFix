// frontend/src/pages/Client/Profile.jsx
import { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext.jsx";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import toast from "react-hot-toast";
import { getCurrentLocation } from "../../utils/geocode.js";
import api from "../../api/axios.js";

export default function ClientProfile() {
  const { user, setUser } = useAppContext();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    location: { lat: null, lng: null, address: "" },
  });

  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(false);

  // Prefill user data
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        location: user.location || { lat: null, lng: null, address: "" },
      });
      setPreview(user.avatar || null);
    }
  }, [user]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

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
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name || "");
      fd.append("phone", form.phone || "");
      fd.append("address", form.location?.address || form.address || "");
      if (form.location) fd.append("location", JSON.stringify(form.location));
      if (avatar instanceof File) fd.append("avatar", avatar);

      const res = await api.put("/clients/profile", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updatedUser = res.data?.data;
      if (updatedUser) {
        setUser((prev) => ({
          ...prev,
          ...updatedUser,
          role: updatedUser.role || prev?.role || "client",
          avatar: updatedUser.avatar ?? prev?.avatar ?? "",
        }));
        if (updatedUser.avatar) setPreview(updatedUser.avatar);

        toast.success(" Profile updated successfully!");
        navigate("/", { replace: true });
      }
    } catch (err) {
      console.error("Profile update failed:", err);
      toast.error(err?.response?.data?.message || "Profile update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-50 to-indigo-50 px-4">
      <Card className="w-full max-w-md p-6 shadow-xl border border-gray-100">
        <h2 className="text-3xl font-extrabold text-center bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent mb-6">
          👤 Update Profile
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Avatar */}
          <div className="flex flex-col items-center">
            <label className="cursor-pointer group">
              <div className="w-28 h-28 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300 group-hover:border-sky-400 transition overflow-hidden shadow-sm">
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-28 h-28 rounded-full object-cover group-hover:scale-105 transition-transform"
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

          {/* Inputs */}
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

          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone"
            className="input"
          />

          <input
            type="text"
            placeholder="Enter your address"
            value={form.location.address || form.address}
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

          <Button
            type="submit"
            variant="primary"
            className="w-full py-2 text-sm font-semibold shadow-sm hover:scale-105 transition-transform"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
