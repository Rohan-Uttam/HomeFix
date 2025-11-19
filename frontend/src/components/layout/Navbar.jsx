import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "../../context/AppContext.jsx";
import NotificationDropdown from "../NotificationDropdown.jsx";
import AuthModal from "../AuthModal.jsx";

export default function Navbar() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const { user, logout } = useAppContext();
  const navigate = useNavigate();

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target) &&
        notifRef.current &&
        !notifRef.current.contains(e.target)
      ) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getInitials = (name) => {
    if (!name || typeof name !== "string") return "NA";
    const parts = name.trim().split(" ");
    return parts.length === 1
      ? parts[0][0].toUpperCase()
      : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const Avatar = ({ size = "w-9 h-9", textSize = "text-sm" }) => {
    let avatarUrl = null;
    if (user?.avatar && user.avatar.trim() !== "") {
      avatarUrl = user.avatar.startsWith("http")
        ? user.avatar
        : `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}${user.avatar}`;
    } else if (user?.profileImage && user.profileImage.trim() !== "") {
      avatarUrl = user.profileImage.startsWith("http")
        ? user.profileImage
        : `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}${user.profileImage}`;
    }

    if (avatarUrl) {
      return (
        <img
          src={`${avatarUrl}?v=${Date.now()}`}
          alt="User Avatar"
          className={`${size} rounded-full border-2 border-sky-500 shadow-md object-cover transition-all duration-300 hover:scale-110`}
        />
      );
    }

    return (
      <div
        className={`${size} rounded-full border-2 border-sky-500 shadow-md flex items-center justify-center bg-sky-100 text-sky-700 font-semibold ${textSize} transition-transform duration-300 hover:scale-110`}
      >
        {getInitials(user?.name)}
      </div>
    );
  };

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-200">
      <div className="container mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo + Nav */}
        <div className="flex items-center space-x-8">
          <Link
            to="/"
            className="text-2xl font-extrabold bg-gradient-to-r from-sky-500 to-indigo-600 bg-clip-text text-transparent hover:scale-105 transition-transform"
          >
            Home<span className="text-gray-800">Services</span>
          </Link>

          <nav className="hidden md:flex space-x-2 text-gray-700 font-medium">
            <NavLink to="/" label="Home" />
            {user?.role === "client" && (
              <>
                <NavLink to="/client/dashboard" label="Find My Worker" />
                <NavLink to="/client/bookings" label="My Bookings" />
              </>
            )}
            {user?.role === "worker" && (
              <>
                <NavLink to="/worker/dashboard" label="Dashboard" />
                <NavLink to="/worker/jobs" label="Jobs" />
              </>
            )}
            {user?.role === "admin" && (
              <NavLink to="/admin/dashboard" label="Admin Dashboard" />
            )}
          </nav>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-6">
          {user && (
            <motion.div
              ref={notifRef}
              whileHover={{ scale: 1.12 }} // 🔹 removed rotate tilt
              transition={{ type: "spring", stiffness: 400, damping: 12 }}
              className="cursor-pointer"
            >
              <NotificationDropdown />
            </motion.div>
          )}

          {user ? (
            <div className="relative" ref={profileRef}>
              <div
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="cursor-pointer"
              >
                <Avatar />
              </div>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="absolute right-0 mt-3 w-64 bg-white border rounded-xl shadow-xl z-50 overflow-hidden"
                  >
                    <div className="flex items-center gap-3 p-4 border-b bg-gray-50">
                      <Avatar size="w-12 h-12" textSize="text-lg" />
                      <div className="truncate">
                        <p className="font-bold text-gray-900 truncate">{user.name}</p>
                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                        <span className="text-xs text-sky-600 font-medium capitalize">
                          {user.role}
                        </span>
                      </div>
                    </div>

                    <div className="p-2">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          navigate(
                            user.role === "client"
                              ? "/client/profile"
                              : user.role === "worker"
                              ? "/worker/profile"
                              : "/"
                          );
                        }}
                        className="block w-full text-left px-4 py-2 rounded-md hover:bg-sky-50 transition-colors"
                      >
                        👤 Profile
                      </button>
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          logout();
                        }}
                        className="block w-full text-left px-4 py-2 rounded-md text-red-600 hover:bg-red-50 transition-colors"
                      >
                        🚪 Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <NavLink to="/login" label="Login" />
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-sky-600 focus:outline-none text-2xl"
        >
          {isOpen ? "✖" : "☰"}
        </button>
      </div>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white/95 backdrop-blur-md border-t shadow-lg p-4 space-y-3"
          >
            <NavLink to="/" label="Home" onClick={() => setIsOpen(false)} />
            {user ? (
              <>
                {user.role === "client" && (
                  <>
                    <NavLink to="/client/dashboard" label="Find My Worker" onClick={() => setIsOpen(false)} />
                    <NavLink to="/client/bookings" label="My Bookings" onClick={() => setIsOpen(false)} />
                  </>
                )}
                {user.role === "worker" && (
                  <>
                    <NavLink to="/worker/dashboard" label="Dashboard" onClick={() => setIsOpen(false)} />
                    <NavLink to="/worker/jobs" label="Jobs" onClick={() => setIsOpen(false)} />
                  </>
                )}
                {user.role === "admin" && (
                  <NavLink to="/admin/dashboard" label="Admin Dashboard" onClick={() => setIsOpen(false)} />
                )}
                <button
                  onClick={() => {
                    navigate(
                      user.role === "client"
                        ? "/client/profile"
                        : user.role === "worker"
                        ? "/worker/profile"
                        : "/"
                    );
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-2 py-2 rounded-md hover:bg-sky-50 transition-colors"
                >
                  👤 Profile
                </button>
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="block w-full text-left text-red-600 hover:bg-red-50 px-2 py-2 rounded-md transition-colors"
                >
                  🚪 Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" label="Login" onClick={() => setIsOpen(false)} />
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setShowAuthModal(true);
                  }}
                  className="block w-full text-left px-2 py-2 rounded-md bg-gradient-to-r from-sky-500 via-purple-500 to-pink-500 text-white shadow-md transition hover:opacity-90"
                >
                  Get Started
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {showAuthModal && (
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      )}
    </header>
  );
}

function NavLink({ to, label, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="relative px-4 py-2 rounded-md transition-all duration-500 ease-in-out
                 hover:text-white hover:shadow-md
                 hover:bg-gradient-to-r hover:from-sky-500 hover:via-purple-500 hover:to-pink-500"
    >
      {label}
    </Link>
  );
}
