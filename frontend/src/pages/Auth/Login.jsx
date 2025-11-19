import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAppContext } from "../../context/AppContext.jsx";
import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import toast from "react-hot-toast";

export default function Login() {
  const { login } = useAppContext();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password)
      return toast.error("Please fill all fields");

    try {
      setLoading(true);
      const result = await login(form);

      if (result?.success) {
        toast.success("🎉 Welcome back!");
        navigate("/");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error(err?.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-500 via-purple-500 to-pink-500 px-4 overflow-hidden">
      {/* Background Blobs */}
      <motion.div
        className="absolute -top-20 -left-20 w-72 h-72 bg-sky-400 rounded-full filter blur-3xl opacity-30"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-20 right-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-20"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md z-10"
      >
        <Card className="p-8 shadow-2xl border border-white/20 backdrop-blur-xl bg-white/80">
          <h2 className="text-3xl font-extrabold text-center bg-gradient-to-r from-sky-500 to-pink-500 bg-clip-text text-transparent mb-6">
            🔑 Login to HomeServices
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <motion.input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              whileFocus={{ scale: 1.02 }}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-500 transition"
            />

            {/* Password */}
            <motion.input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              whileFocus={{ scale: 1.02 }}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-500 transition"
            />

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              className="w-full py-3 text-lg font-semibold shadow-lg bg-gradient-to-r from-sky-500 to-pink-500 text-white rounded-lg hover:opacity-90 hover:scale-[1.02] transition-transform"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>

          {/* Extra Links */}
          <div className="mt-6 text-center text-gray-700 text-sm">
            <p>
              Don’t have an account?{" "}
              <Link
                to="/register"
                className="font-semibold bg-gradient-to-r from-sky-500 to-pink-500 bg-clip-text text-transparent hover:underline"
              >
                Register here
              </Link>
            </p>
            <p className="mt-2">
              Are you a worker?{" "}
              <Link
                to="/register/worker"
                className="font-semibold bg-gradient-to-r from-sky-500 to-pink-500 bg-clip-text text-transparent hover:underline"
              >
                Register as Worker
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
