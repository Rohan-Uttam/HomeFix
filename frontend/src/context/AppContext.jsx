import { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../api/authApi.js";
import { notificationApi } from "../api/notificationApi.js";
import { initSocket, getSocket } from "../utils/socketClient.js";
import toast from "react-hot-toast";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Load user from localStorage on refresh
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("⚠️ Corrupt user in localStorage, clearing...");
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  // 🔹 Notifications setup
  useEffect(() => {
    if (!user?._id) return;

    const token = localStorage.getItem("token");
    const socket = initSocket(token);

    socket.emit("joinNotifications", user._id);

    socket.on("notification:new", (notif) => {
      setNotifications((prev) => [notif, ...prev]);
    });

    (async () => {
      try {
        const res = await notificationApi.getAll(); // ✅ fixed
        setNotifications(res.data.data || []);
      } catch (err) {
        console.error("Failed to load notifications", err);
      }
    })();

    return () => {
      const socket = getSocket();
      if (socket) socket.off("notification:new");
    };
  }, [user]);

  // 🔹 Utility functions
  const refreshNotifications = async () => {
    try {
      const res = await notificationApi.getAll();
      setNotifications(res.data.data || []);
    } catch (err) {
      console.error("Failed to refresh notifications", err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const normalizeUser = (u) =>
    u
      ? {
          ...u,
          avatar: u.avatar?.trim() || "",
          role: u.role || "client",
        }
      : null;

  // 🔹 Auth functions
const login = async (credentials) => {
  try {
    const res = await authApi.login(credentials);
    const { user: u, token } = res.data.data;

    if (u.isBlocked) {
      toast.error("Your account is blocked. Contact support.");
      return { success: false };
    }

    const normalized = normalizeUser(u);
    setUser(normalized);

    if (token) localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(normalized));

    return { success: true, user: normalized };
  } catch (err) {
    toast.error(err.response?.data?.message || "Login failed");
    return { success: false };
  }
};


  const register = async (data) => {
    const res = await authApi.register(data, true);
    return res.data.data;
  };

  const verifyOtp = async (data) => {
    const res = await authApi.verifyOtp(data);
    const result = res.data.data;

    if (result?.token && result?.user) {
      if (result.user.isBlocked) {
        toast.error("Your account is blocked. Contact support.");
        return null;
      }

      localStorage.setItem("token", result.token);

      const normalized = normalizeUser(result.user);
      setUser(normalized);

      localStorage.setItem("user", JSON.stringify(normalized));
    }
    return result;
  };

  const logout = (navigate) => {
    setUser(null);
    setNotifications([]);
    localStorage.clear();

    if (typeof navigate === "function") {
      navigate("/login");
    } else {
      window.location.href = "/login";
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        notifications,
        setNotifications,
        refreshNotifications,
        markAsRead,
        login,
        register,
        verifyOtp,
        logout,
        loading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
