import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, LayoutDashboard, Users, Wrench } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "../../context/AppContext.jsx";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAppContext();
  const navigate = useNavigate();

  const navItems = [
    { to: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { to: "/admin/users", label: "Manage Users", icon: <Users className="w-5 h-5" /> },
    { to: "/admin/jobs", label: "Manage Jobs", icon: <Wrench className="w-5 h-5" /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || window.innerWidth >= 768) && (
          <motion.aside
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            exit={{ x: -260 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed z-40 top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 shadow-2xl border-r border-gray-200 dark:border-gray-700 md:translate-x-0"
          >
            <div className="flex flex-col h-full p-5">
              {/* Logo */}
              <motion.h2
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-2xl font-extrabold mb-10 flex items-center gap-2 bg-gradient-to-r from-sky-500 to-indigo-600 bg-clip-text text-transparent"
              >
                ⚙️ Admin Panel
              </motion.h2>

              {/* Nav Items */}
              <nav className="flex flex-col gap-2 flex-1">
                {navItems.map((item, i) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `px-4 py-3 rounded-lg flex items-center gap-3 text-sm font-semibold transition-all duration-300 ${
                        isActive
                          ? "bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md scale-[1.02]"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-[1.01]"
                      }`
                    }
                  >
                    {item.icon}
                    {item.label}
                  </NavLink>
                ))}
              </nav>

              {/* Logout */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => logout(navigate)}
                className="mt-6 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold shadow hover:shadow-lg"
              >
                <LogOut className="w-5 h-5" /> Logout
              </motion.button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col md:ml-64 transition-all">
        {/* Topbar */}
        <header className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 shadow-lg border-b border-gray-200 dark:border-gray-700 md:hidden">
          <h1 className="text-lg font-bold bg-gradient-to-r from-sky-500 to-indigo-600 bg-clip-text text-transparent">
            Admin
          </h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
