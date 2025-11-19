import { useEffect, useState } from "react";
import Card from "../../components/ui/Card.jsx";
import api from "../../api/axios.js";
import { useAppContext } from "../../context/AppContext.jsx";
import { io } from "socket.io-client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const { user } = useAppContext();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch stats from backend
  const fetchStats = async () => {
    try {
      const res = await api.get("/admin/stats");
      setStats(res.data.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  // 🔹 Real-time updates via Socket.io
  useEffect(() => {
    const socket = io(
      import.meta.env.VITE_API_URL ||
        "https://service-finder-qcj8.onrender.com",
      {
        transports: ["websocket"],
      }
    );

    socket.on("admin:statsUpdated", () => fetchStats());
    return () => socket.disconnect();
  }, []);

  if (loading)
    return <p className="text-center text-gray-500">⏳ Loading stats...</p>;
  if (!stats)
    return <p className="text-center text-red-500">❌ Failed to load stats.</p>;

  const cards = [
    {
      id: 1,
      title: "Total Users",
      value: stats.totalUsers,
      color: "from-sky-500 to-sky-700",
      icon: "👥",
    },
    {
      id: 2,
      title: "Workers",
      value: stats.totalWorkers,
      color: "from-green-500 to-green-700",
      icon: "🛠",
    },
    {
      id: 3,
      title: "Clients",
      value: stats.totalClients,
      color: "from-purple-500 to-purple-700",
      icon: "📦",
    },
    {
      id: 4,
      title: "Total Jobs",
      value: stats.totalJobs,
      color: "from-indigo-500 to-indigo-700",
      icon: "📋",
    },
    {
      id: 5,
      title: "Revenue",
      value: `₹${stats.totalRevenue || 0}`,
      color: "from-yellow-500 to-yellow-700",
      icon: "💰",
    },
  ];

  const COLORS = ["#fbbf24", "#22c55e", "#ef4444", "#3b82f6"];

  return (
    <div className="space-y-10">
      {/* Header */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl font-extrabold flex items-center gap-3 bg-gradient-to-r from-sky-500 to-indigo-600 bg-clip-text text-transparent"
      >
        📊 Admin Dashboard
      </motion.h1>

      {/* 🔹 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {cards.map((stat, i) => (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className={`flex flex-col items-center justify-center py-6 px-4 text-center shadow-lg hover:shadow-2xl hover:scale-[1.05] transition-all duration-300 rounded-2xl bg-gradient-to-r ${stat.color} text-white backdrop-blur-xl`}
          >
            <span className="text-4xl">{stat.icon}</span>
            <h2 className="text-sm sm:text-base font-semibold mt-3 opacity-90">
              {stat.title}
            </h2>
            <p className="text-2xl sm:text-3xl font-bold mt-2">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* 🔹 Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Users Growth */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="p-6 shadow-md bg-white rounded-2xl">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              👥 Users Growth
            </h2>
            {stats.analytics?.userGrowth?.length ? (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={stats.analytics.userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-400 italic">
                No growth data available 📉
              </p>
            )}
          </Card>
        </motion.div>

        {/* Jobs by Status */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="p-6 shadow-md bg-white rounded-2xl">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              🛠 Jobs by Status
            </h2>
            {stats.analytics?.jobsByStatus?.length ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={stats.analytics.jobsByStatus}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, value }) => `${name} (${value})`}
                    dataKey="count"
                  >
                    {stats.analytics.jobsByStatus.map((entry, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-400 italic">
                No job status data 🛠
              </p>
            )}
          </Card>
        </motion.div>

        {/* Revenue by Month */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="lg:col-span-2"
        >
          <Card className="p-6 shadow-md bg-white rounded-2xl">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              💰 Monthly Revenue
            </h2>
            {stats.analytics?.revenueByMonth?.length ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.analytics.revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="total"
                    fill="#10b981"
                    barSize={45}
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-400 italic">
                No revenue data 💸
              </p>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
