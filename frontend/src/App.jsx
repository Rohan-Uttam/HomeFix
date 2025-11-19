// frontend/src/App.jsx
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AppProvider, useAppContext } from "./context/AppContext.jsx";
import Navbar from "./components/layout/Navbar.jsx";
import Footer from "./components/layout/Footer.jsx";
import { Toaster } from "react-hot-toast";
import ScrollToTop from "./components/layout/ScrollToTop.jsx";
import AuthModal from "./components/AuthModal.jsx"; // ✅ import modal
import { useState } from "react";

// Public Pages
import Home from "./pages/Home.jsx";
import Login from "./pages/Auth/Login.jsx";
import Register from "./pages/Auth/Register.jsx";
import WorkerRegister from "./pages/Auth/WorkerRegisterCustom.jsx";
import VerifyOtp from "./pages/Auth/VerifyOtp.jsx";
import NotFound from "./pages/NotFound.jsx";

// Client Pages
import ClientDashboard from "./pages/Client/Dashboard.jsx";
import ClientProfile from "./pages/Client/Profile.jsx";
import MyBookings from "./pages/Client/MyBookings.jsx";
import MyJobs from "./pages/Client/MyJobs.jsx";
import JobRequest from "./pages/Client/JobRequest.jsx";
import Search from "./pages/Client/Search.jsx";

// Worker Pages
import WorkerDashboard from "./pages/Worker/Dashboard.jsx";
import WorkerProfile from "./pages/Worker/Profile.jsx";
import WorkerJobs from "./pages/Worker/Jobs.jsx";

// Admin Pages
import AdminLayout from "./pages/Admin/AdminLayout.jsx";
import AdminDashboard from "./pages/Admin/Dashboard.jsx";
import ManageUsers from "./pages/Admin/ManageUsers.jsx";
import ManageJobs from "./pages/Admin/ManageJobs.jsx";

// Payment Pages
import Checkout from "./pages/Payment/Checkout.jsx";
import PaymentSuccess from "./pages/Payment/PaymentSuccess.jsx";

// 🔹 Protected Route Wrapper
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAppContext();

  if (loading) {
    return (
      <p className="text-center mt-10 text-gray-600 font-medium">
        ⏳ Checking authentication...
      </p>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  const location = useLocation();
  const hideFooterAndNavbar = location.pathname.startsWith("/admin");

  // ✅ Modal ko global yaha control karenge
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <AppProvider>
      <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-100">
        
        {/* Navbar (hide for admin) */}
        {!hideFooterAndNavbar && <Navbar onOpenAuthModal={() => setShowAuthModal(true)} />}

        <ScrollToTop />

        {/* Main Content */}
        <main className="flex-grow">
          {/* For public/client/worker wrap in container, admin layout already has its own */}
          <div className={!hideFooterAndNavbar ? "container mx-auto px-4 py-6" : ""}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home onOpenAuthModal={() => setShowAuthModal(true)} />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/register/worker" element={<WorkerRegister />} />
              <Route path="/verify-otp" element={<VerifyOtp />} />

              {/* Client Routes */}
              <Route
                path="/client/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["client"]}>
                    <ClientDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/client/profile"
                element={
                  <ProtectedRoute allowedRoles={["client"]}>
                    <ClientProfile />
                  </ProtectedRoute>
                }
              />
              <Route path="/worker-register-custom" element={<WorkerRegister />} />

              <Route
                path="/client/bookings"
                element={
                  <ProtectedRoute allowedRoles={["client"]}>
                    <MyBookings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-jobs"
                element={
                  <ProtectedRoute allowedRoles={["client"]}>
                    <MyJobs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/job-request"
                element={
                  <ProtectedRoute allowedRoles={["client"]}>
                    <JobRequest />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/search"
                element={
                  <ProtectedRoute allowedRoles={["client"]}>
                    <Search />
                  </ProtectedRoute>
                }
              />

              {/* Worker Routes */}
              <Route
                path="/worker/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["worker"]}>
                    <WorkerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/worker/profile"
                element={
                  <ProtectedRoute allowedRoles={["worker"]}>
                    <WorkerProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/worker/jobs"
                element={
                  <ProtectedRoute allowedRoles={["worker"]}>
                    <WorkerJobs />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes (use AdminLayout only) */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<ManageUsers />} />
                <Route path="jobs" element={<ManageJobs />} />
              </Route>

              {/* Payment */}
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute allowedRoles={["client"]}>
                    <Checkout />
                  </ProtectedRoute>
                }
              />
              <Route path="/payment-success" element={<PaymentSuccess />} />

              {/* Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </main>

        {/* Footer (hide for admin) */}
        {!hideFooterAndNavbar && <Footer />}

        {/* 🔐 Auth Modal (Global, always centered) */}
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

        {/* Toast */}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#333",
              color: "#fff",
              fontSize: "14px",
              borderRadius: "8px",
              padding: "12px 16px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            },
          }}
        />
      </div>
    </AppProvider>
  );
}
