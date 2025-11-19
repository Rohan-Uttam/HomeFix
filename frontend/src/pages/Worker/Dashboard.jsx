import { useEffect, useState } from "react";
import Card from "../../components/ui/Card.jsx";
import LoadingButton from "../../components/ui/LoadingButton.jsx"; // 🔹 Updated import
import { formatDate } from "../../utils/formatDate.js";
import { bookingApi } from "../../api/bookingApi.js";
import api from "../../api/axios.js";
import { useAppContext } from "../../context/AppContext.jsx";
import toast from "react-hot-toast";
import {
  FaBriefcase,
  FaUserClock,
  FaMoneyBillWave,
  FaMapMarkerAlt,
  FaUser,
} from "react-icons/fa";

export default function WorkerDashboard() {
  const { user, setUser } = useAppContext();

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  // 🔹 Fetch worker profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);
        const res = await api.get("/workers/me");
        const data = res.data?.data;
        if (data) {
          setProfile(data);
          setUser((prev) => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.error("Worker dashboard profile error:", err);
      } finally {
        setLoadingProfile(false);
      }
    };
    if (user?.role === "worker") fetchProfile();
  }, [user?.role, setUser]);

  // 🔹 Fetch worker jobs (bookings)
  useEffect(() => {
    const fetchBookings = async () => {
      setLoadingJobs(true);
      try {
        const res = await bookingApi.getWorkerBookings();
        setJobs(res.data?.data || []);
      } catch (err) {
        console.error("Failed to load worker bookings:", err);
        toast.error("Failed to load your jobs");
      } finally {
        setLoadingJobs(false);
      }
    };
    if (user?.role === "worker") fetchBookings();
  }, [user?.role]);

  // 🔹 Accept/Reject decision
  const handleDecision = async (id, status) => {
    try {
      await bookingApi.updateStatus(id, status);
      setJobs((prev) =>
        prev.map((j) => (j._id === id ? { ...j, status } : j))
      );
      toast.success(`Job ${status}`);
    } catch (err) {
      console.error("Failed to update booking:", err);
      toast.error("Update failed");
    }
  };

  if (loadingProfile)
    return (
      <div className="flex justify-center items-center h-[60vh] text-gray-600 text-lg">
        ⏳ Loading profile...
      </div>
    );

  if (!profile)
    return (
      <div className="text-center py-16 text-gray-500">
        No profile found. Please complete your profile.
      </div>
    );

  const avatar =
    profile.profileImage ||
    profile.user?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      profile.user?.name || "Worker"
    )}&background=0D8ABC&color=fff`;

  const displayedCategory =
    profile.category?.toLowerCase() === "other" && profile.customCategory
      ? profile.customCategory
      : profile.category || "Other";

  return (
    <div className="container mx-auto px-4 py-8 space-y-10">
      {/* Worker Profile */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-extrabold mb-6 text-sky-700 flex items-center gap-2">
          👷‍♂️ Worker Profile
        </h2>

        <Card className="p-6 flex flex-col sm:flex-row items-center gap-6 bg-white shadow-lg rounded-2xl hover:shadow-2xl transition-all">
          <div className="flex-shrink-0">
            <img
              src={avatar}
              alt={profile.user?.name}
              className="w-32 h-32 rounded-full border-4 border-sky-500 object-cover shadow-md"
            />
          </div>

          <div className="flex-1 text-gray-800">
            <h3 className="text-xl font-bold text-gray-900">
              {profile.user?.name}
            </h3>
            <p className="text-sm text-gray-500 mb-2">{profile.user?.email}</p>

            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <FaBriefcase className="text-pink-500" />
                {displayedCategory}
                {profile.subcategory && ` • ${profile.subcategory}`}
              </p>
              <p className="flex items-center gap-2">
                <FaUserClock className="text-gray-700" />
                Experience: {profile.experience || 0} yrs
              </p>
              <p className="flex items-center gap-2">
                <FaMoneyBillWave className="text-green-600" />
                Rate: ₹{profile.hourlyRate || 0} /{" "}
                {profile.rateType || "hour"}
              </p>
              <p className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-rose-500" />
                {profile.location?.address || "Not Provided"}
              </p>
              <p className="flex items-center gap-2">
                <FaUser className="text-indigo-500" />
                Availability: {profile.availability || "flexible"}
              </p>
            </div>

            {profile.bio && (
              <p className="mt-3 italic text-gray-500 border-t pt-2">
                “{profile.bio}”
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Client Requests */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-extrabold mb-4 text-sky-700">
          📋 Client Requests
        </h2>

        {loadingJobs ? (
          <p className="text-center text-gray-500">⏳ Loading your jobs...</p>
        ) : !jobs.length ? (
          <p className="text-center text-gray-400">No client requests yet.</p>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <Card
                key={job._id}
                className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
              >
                <div>
                  <h3 className="font-semibold text-gray-800 text-base">
                    {job.service?.subcategory ||
                      job.service?.category ||
                      "Service"}
                  </h3>
                  <p className="text-xs text-gray-600">
                    Client: {job.client?.name || "Unknown"}
                  </p>
                  <p className="text-xs text-gray-500">
                    Date: {formatDate(job.createdAt)}
                  </p>
                  <span
                    className={`inline-block mt-2 text-[11px] px-2 py-0.5 rounded font-medium capitalize ${
                      job.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : job.status === "accepted"
                        ? "bg-sky-100 text-sky-700"
                        : job.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : job.status === "pending"
                        ? "bg-gray-100 text-gray-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {job.status}
                  </span>
                </div>

                {/* Buttons with Loading Feedback */}
                {job.status === "pending" && (
                  <div className="flex gap-2 mt-3 sm:mt-0">
                    <LoadingButton
                      onClick={() => handleDecision(job._id, "accepted")}
                      className="px-3 py-1 text-xs"
                    >
                      Accept
                    </LoadingButton>
                    <LoadingButton
                      onClick={() => handleDecision(job._id, "rejected")}
                      className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700"
                    >
                      Reject
                    </LoadingButton>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
