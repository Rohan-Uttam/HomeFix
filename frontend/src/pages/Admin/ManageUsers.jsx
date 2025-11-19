import { useEffect, useState } from "react";
import api from "../../api/axios.js";
import { useAppContext } from "../../context/AppContext.jsx";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button.jsx";
import { io } from "socket.io-client";

export default function ManageUsers() {
  const { user } = useAppContext();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch Users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/users", {
        params: { role: filterRole, search },
      });
      const usersData = res.data?.data;
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      console.error("Fetch users error:", error);
      toast.error(error?.response?.data?.message || "Failed to fetch users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, filterRole]);

  // 🔹 Real-time socket updates (Connected to Render backend)
  useEffect(() => {
    const socket = io(
      import.meta.env.VITE_API_URL ||
        "https://service-finder-qcj8.onrender.com",
      {
        transports: ["websocket"],
      }
    );

    socket.on("admin:statsUpdated", () => fetchUsers());
    return () => socket.disconnect();
  }, []);

  // 🔹 Delete User
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success("User deleted");
      fetchUsers();
    } catch (error) {
      console.error("Delete user error:", error);
      toast.error(error?.response?.data?.message || "Delete failed");
    }
  };

  // 🔹 Block / Unblock User
  const handleBlockToggle = async (id) => {
    try {
      const res = await api.patch(`/admin/users/${id}/block`, {});
      toast.success(res.data?.message || "Block status updated");
      fetchUsers();
    } catch (error) {
      console.error("Block user error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to update block status"
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <h1 className="text-3xl font-extrabold flex items-center gap-2 bg-gradient-to-r from-sky-500 to-indigo-600 bg-clip-text text-transparent">
        👥 Manage Users
      </h1>

      {/* 🔎 Search + Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-1/3 px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none shadow-sm"
        />
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none shadow-sm"
        >
          <option value="all">All Roles</option>
          <option value="client">Client</option>
          <option value="worker">Worker</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* 📊 Users Table (Desktop) */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden hidden md:block border border-gray-200">
        <table className="w-full border-collapse text-sm md:text-base">
          <thead>
            <tr className="bg-gradient-to-r from-sky-100 to-indigo-100 text-gray-700">
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="p-6 text-center text-gray-500">
                  ⏳ Loading users...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-6 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((u, idx) => (
                <tr
                  key={u._id}
                  className={`transition-all ${
                    idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } hover:bg-sky-50`}
                >
                  <td className="p-3 font-medium text-gray-800">{u.name}</td>
                  <td className="p-3 text-gray-600">{u.email}</td>
                  <td className="p-3 capitalize">{u.role}</td>
                  <td
                    className={`p-3 font-semibold ${
                      u.isBlocked ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {u.isBlocked ? "Blocked" : "Active"}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-4">
                      <Button
                        variant="secondary"
                        onClick={() => handleBlockToggle(u._id)}
                        className={`px-4 py-2 transition ${
                          u.isBlocked
                            ? "bg-green-500 text-white hover:bg-green-600"
                            : "bg-yellow-500 text-white hover:bg-yellow-600"
                        }`}
                      >
                        {u.isBlocked ? "Unblock" : "Block"}
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleDelete(u._id)}
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
          <p className="text-center text-gray-500">⏳ Loading users...</p>
        ) : users.length === 0 ? (
          <p className="text-center text-gray-500">No users found</p>
        ) : (
          users.map((u) => (
            <div
              key={u._id}
              className="border rounded-xl p-4 shadow-sm bg-white hover:shadow-md transition"
            >
              <p>
                <strong>Name:</strong> {u.name}
              </p>
              <p>
                <strong>Email:</strong> {u.email}
              </p>
              <p>
                <strong>Role:</strong> {u.role}
              </p>
              <p
                className={
                  u.isBlocked
                    ? "text-red-600 font-semibold"
                    : "text-green-600 font-semibold"
                }
              >
                <strong>Status:</strong> {u.isBlocked ? "Blocked" : "Active"}
              </p>
              <div className="flex gap-3 mt-3">
                <Button
                  variant="secondary"
                  className={`flex-1 px-4 py-2 transition ${
                    u.isBlocked
                      ? "bg-green-500 text-white hover:bg-green-600"
                      : "bg-yellow-500 text-white hover:bg-yellow-600"
                  }`}
                  onClick={() => handleBlockToggle(u._id)}
                >
                  {u.isBlocked ? "Unblock" : "Block"}
                </Button>
                <Button
                  variant="danger"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white hover:opacity-90 transition"
                  onClick={() => handleDelete(u._id)}
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
