import { useEffect, useState } from "react";
import api from "../../api/axios.js";
import { useAppContext } from "../../context/AppContext.jsx";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button.jsx";
import { io } from "socket.io-client";

export default function ManageJobs() {
  const { user } = useAppContext();
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch Jobs
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/jobs", {
        params: { status: filterStatus, search },
      });
      const jobsData = res.data?.data;
      setJobs(Array.isArray(jobsData) ? jobsData : []);
    } catch (error) {
      console.error("Fetch jobs error:", error);
      toast.error(error?.response?.data?.message || "Failed to fetch jobs");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [search, filterStatus]);

  // 🔹 Real-time socket updates (Connected to Render backend)
  useEffect(() => {
    const socket = io(
      import.meta.env.VITE_API_URL ||
        "https://service-finder-qcj8.onrender.com",
      {
        transports: ["websocket"],
      }
    );

    socket.on("admin:statsUpdated", () => fetchJobs());
    return () => socket.disconnect();
  }, []);

  // 🔹 Delete Job
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    try {
      await api.delete(`/admin/jobs/${id}`);
      toast.success("Job deleted");
      fetchJobs();
    } catch (error) {
      console.error("Delete job error:", error);
      toast.error(error?.response?.data?.message || "Delete failed");
    }
  };

  // 🔹 Update Status
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await api.patch(`/admin/jobs/${id}/status`, { status: newStatus });
      toast.success("Job status updated");
      fetchJobs();
    } catch (error) {
      console.error("Update job status error:", error);
      toast.error(error?.response?.data?.message || "Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <h1 className="text-3xl font-extrabold flex items-center gap-2 bg-gradient-to-r from-sky-500 to-indigo-600 bg-clip-text text-transparent">
        🛠️ Manage Jobs
      </h1>

      {/* 🔎 Search + Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <input
          type="text"
          placeholder="Search by service/description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-1/3 px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none shadow-sm"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none shadow-sm"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* 📊 Jobs Table (Desktop) */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden hidden md:block border border-gray-200">
        <table className="w-full border-collapse text-sm md:text-base">
          <thead>
            <tr className="bg-gradient-to-r from-sky-100 to-indigo-100 text-gray-700">
              <th className="p-3 text-left">Service</th>
              <th className="p-3 text-left">Client</th>
              <th className="p-3 text-left">Worker</th>
              <th className="p-3 text-left">Price</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="p-6 text-center text-gray-500">
                  ⏳ Loading jobs...
                </td>
              </tr>
            ) : jobs.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-6 text-center text-gray-500">
                  No jobs found
                </td>
              </tr>
            ) : (
              jobs.map((job, idx) => (
                <tr
                  key={job._id}
                  className={`transition-all ${
                    idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } hover:bg-sky-50`}
                >
                  <td className="p-3 font-medium text-gray-800">
                    {job.service}
                  </td>
                  <td className="p-3">{job.client?.name}</td>
                  <td className="p-3">{job.worker?.user?.name || "N/A"}</td>
                  <td className="p-3 font-semibold">₹{job.price}</td>
                  <td
                    className={`p-3 font-semibold capitalize ${
                      job.status === "completed"
                        ? "text-green-600"
                        : job.status === "pending"
                        ? "text-yellow-600"
                        : ["rejected", "cancelled"].includes(job.status)
                        ? "text-red-600"
                        : "text-blue-600"
                    }`}
                  >
                    {job.status}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-4">
                      <select
                        onChange={(e) =>
                          handleStatusUpdate(job._id, e.target.value)
                        }
                        defaultValue=""
                        className="px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-sky-500 shadow-sm"
                      >
                        <option value="" disabled>
                          Change Status
                        </option>
                        <option value="pending">Pending</option>
                        <option value="accepted">Accepted</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <Button
                        variant="danger"
                        onClick={() => handleDelete(job._id)}
                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white hover:opacity-90 transition"
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 📱 Mobile Card View */}
      <div className="grid gap-4 md:hidden">
        {loading ? (
          <p className="text-center text-gray-500">⏳ Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <p className="text-center text-gray-500">No jobs found</p>
        ) : (
          jobs.map((job) => (
            <div
              key={job._id}
              className="border rounded-xl p-4 shadow-sm bg-white hover:shadow-md transition"
            >
              <p>
                <strong>Service:</strong> {job.service}
              </p>
              <p>
                <strong>Client:</strong> {job.client?.name}
              </p>
              <p>
                <strong>Worker:</strong> {job.worker?.user?.name || "N/A"}
              </p>
              <p>
                <strong>Price:</strong> ₹{job.price}
              </p>
              <p className="capitalize">
                <strong>Status:</strong>{" "}
                <span
                  className={
                    job.status === "completed"
                      ? "text-green-600 font-semibold"
                      : job.status === "pending"
                      ? "text-yellow-600 font-semibold"
                      : ["rejected", "cancelled"].includes(job.status)
                      ? "text-red-600 font-semibold"
                      : "text-blue-600 font-semibold"
                  }
                >
                  {job.status}
                </span>
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-3">
                <select
                  onChange={(e) => handleStatusUpdate(job._id, e.target.value)}
                  defaultValue=""
                  className="px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-sky-500 flex-1 shadow-sm"
                >
                  <option value="" disabled>
                    Change Status
                  </option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <Button
                  variant="danger"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white hover:opacity-90 transition"
                  onClick={() => handleDelete(job._id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
