import { useEffect, useState } from "react";
import { bookingApi } from "../../api/bookingApi.js";
import toast from "react-hot-toast";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await bookingApi.getWorkerBookings();
      setJobs(res.data?.data || []);
    } catch (err) {
      console.error(" Failed to load jobs:", err.response?.data || err);
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await bookingApi.updateStatus(id, status);
      toast.success(`Booking ${status}`);
      fetchJobs();
    } catch (err) {
      console.error(" Failed to update job:", err.response?.data || err);
      toast.error("Failed to update status");
    }
  };

  if (loading) return <p className="text-center mt-10">⏳ Loading jobs...</p>;

  if (!jobs.length) {
    return (
      <p className="text-center mt-10 text-gray-500">No job requests yet</p>
    );
  }

  return (
    <div className="container mx-auto mt-6 px-4">
      <h2 className="text-3xl font-extrabold mb-8 text-center bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
        🏠 Job Requests
      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <div
            key={job._id}
            className="border rounded-xl p-5 shadow-md bg-white transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
          >
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              👤 Client:{" "}
              <span className="text-sky-600">
                {job.client?.name || "N/A"}
              </span>
            </h3>

            <p className="text-sm text-gray-600">
              <span className="font-semibold">📝 Notes:</span>{" "}
              {job.notes || "N/A"}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">💰 Price:</span> ₹{job.price}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">📌 Status:</span>{" "}
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  job.status === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : job.status === "accepted"
                    ? "bg-green-100 text-green-700"
                    : job.status === "rejected"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {job.status}
              </span>
            </p>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => handleStatusChange(job._id, "accepted")}
                className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold shadow hover:scale-[1.02] transition"
              >
                Accept
              </button>
              <button
                onClick={() => handleStatusChange(job._id, "rejected")}
                className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-r from-red-500 to-rose-600 text-white text-sm font-semibold shadow hover:scale-[1.02] transition"
              >
                ❌ Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
