import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useAppContext } from "../context/AppContext.jsx";
import WorkerCard from "../components/WorkerCard.jsx";
import SearchForm from "../components/SearchForm.jsx";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import AuthModal from "../components/AuthModal.jsx";
import api from "../api/axios.js";
import toast from "react-hot-toast";

function AnimatedCounter({ value, duration = 2, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const end = parseInt(value);
    if (start === end) return;

    let totalDuration = duration * 1000;
    let incrementTime = 30;
    let steps = totalDuration / incrementTime;
    let increment = (end - start) / steps;
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        current = end;
        clearInterval(timer);
      }
      setCount(Math.floor(current));
    }, incrementTime);

    return () => clearInterval(timer);
  }, [inView, value, duration]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

export default function Home() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAppContext();
  const navigate = useNavigate();

  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (filters) => {
    setLoading(true);
    try {
      const res = await api.get("/workers/search", { params: filters });
      const data = res.data?.data ?? [];
      setWorkers(Array.isArray(data) ? data : []);
      if (!data.length) toast.error("No workers found");
    } catch (err) {
      console.error("Search failed:", err.response?.data || err.message);
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && ["client", "worker", "admin"].includes(user.role)) {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <div className="space-y-24 overflow-hidden">
      {/* 🌟 HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl shadow-lg">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600"
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{ backgroundSize: "200% 200%" }}
        />
        <motion.div
          className="absolute -top-20 -left-20 w-64 h-64 md:w-80 md:h-80 bg-sky-400 rounded-full filter blur-3xl opacity-30"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-24 right-0 w-72 h-72 md:w-96 md:h-96 bg-purple-500 rounded-full filter blur-3xl opacity-25"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative z-10 container mx-auto py-20 md:py-28 px-6 text-center space-y-6 md:space-y-8">
          <motion.h1
            className="text-3xl md:text-6xl font-extrabold leading-tight text-white"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            Find Trusted{" "}
            <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
              Home Experts
            </span>{" "}
            🏠
          </motion.h1>

          <motion.p
            className="text-base md:text-xl max-w-2xl mx-auto text-gray-100"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.3 }}
          >
            Hire electricians, plumbers, and other home experts near you — verified and available instantly.
          </motion.p>

          {!user && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="flex justify-center"
            >
              <Button
                className="px-8 md:px-10 py-3 md:py-4 text-base md:text-lg font-semibold rounded-full bg-yellow-400 text-gray-900 shadow-md hover:scale-105 hover:bg-yellow-300 transition-all"
                onClick={() => setShowAuthModal(true)}
              >
                🚀 Get Started
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      {/* 🔍 SEARCH SECTION */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <Card className="max-w-4xl mx-auto p-6 md:p-10 shadow-xl rounded-3xl border border-gray-100">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-sky-700">
            Find Trusted Workers Near You 🔍
          </h2>

          {!user ? (
            <div className="flex flex-col items-center space-y-4">
              <p className="text-gray-600 text-center text-sm md:text-base">
                Login or register to search verified professionals.
              </p>
              <Button
                onClick={() => setShowAuthModal(true)}
                className="px-6 md:px-8 py-2.5 md:py-3 text-base font-semibold rounded-full bg-gradient-to-r from-sky-500 via-purple-500 to-indigo-600 text-white"
              >
                Register / Login
              </Button>
            </div>
          ) : user.role === "client" ? (
            <div className="space-y-8">
              <SearchForm onSearch={handleSearch} />
              {loading ? (
                <p className="text-center text-gray-500">⏳ Searching...</p>
              ) : workers.length === 0 ? (
                <p className="text-center text-gray-400">
                  No results. Try different filters.
                </p>
              ) : (
                <motion.div
                  className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: { transition: { staggerChildren: 0.15 } },
                  }}
                >
                  {workers.map((w, idx) => (
                    <motion.div
                      key={w._id ?? idx}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                    >
                      <WorkerCard worker={w} showLocation />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          ) : null}
        </Card>
      </motion.section>

      {/* 📊 STATS SECTION */}
      <motion.section
        className="py-14 bg-gradient-to-r from-sky-50 via-indigo-50 to-purple-50"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 text-center px-4 md:px-6">
          {[
            { value: 5000, suffix: "+", label: "Jobs Completed" },
            { value: 1200, suffix: "+", label: "Verified Experts" },
            { value: 98, suffix: "%", label: "Client Satisfaction" },
            { value: 24, suffix: "/7", label: "Support Availability" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              viewport={{ once: true }}
              className="bg-white p-6 md:p-8 rounded-3xl shadow-lg border hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
            >
              <h3 className="text-2xl md:text-3xl font-extrabold text-sky-600">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </h3>
              <p className="text-gray-600 mt-2 text-sm md:text-base font-medium">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* 🛡️ TRUST SECTION */}
      <motion.section
        className="container mx-auto grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3 px-4 md:px-6 py-16"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        {[
          {
            icon: "✅",
            title: "Verified Professionals",
            desc: "Every worker is background-verified for safety & reliability.",
          },
          {
            icon: "💳",
            title: "Secure Payments",
            desc: "Seamless and safe transactions with full encryption.",
          },
          {
            icon: "⚡",
            title: "Instant Booking",
            desc: "Hire nearby workers instantly — no waiting required.",
          },
        ].map((item, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -8, scale: 1.03 }}
            className="bg-white p-6 md:p-10 rounded-3xl shadow-lg border hover:shadow-2xl text-center transition-all"
          >
            <div className="text-4xl md:text-5xl mb-3">{item.icon}</div>
            <h3 className="text-base md:text-lg font-semibold text-gray-900">
              {item.title}
            </h3>
            <p className="text-sm text-gray-600 mt-2">{item.desc}</p>
          </motion.div>
        ))}
      </motion.section>

      {/* ❓ FAQ SECTION */}
      <motion.section
        className="container mx-auto px-4 md:px-6 py-16 md:py-20"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl md:text-4xl font-extrabold mb-10 md:mb-12 text-center bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent drop-shadow-md">
          Frequently Asked Questions <span className="text-pink-500">❓</span>
        </h2>

        <div className="max-w-3xl mx-auto space-y-5 md:space-y-6">
          {[
            {
              q: "How do I book a worker?",
              a: "Simply search for your required service, view verified profiles, and confirm your booking instantly.",
            },
            {
              q: "Are payments secure?",
              a: "Absolutely! We use encrypted payment gateways to ensure your transactions are completely safe.",
            },
            {
              q: "Can I cancel my booking?",
              a: "Yes, you can cancel anytime before the job starts, and refunds follow our policy.",
            },
          ].map((faq, i) => (
            <motion.details
              key={i}
              className="group relative bg-white/90 rounded-2xl shadow-md border border-transparent hover:border-sky-300 transition-all overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              viewport={{ once: true }}
            >
              <summary className="cursor-pointer select-none flex items-center justify-between p-4 md:p-5 text-base md:text-lg font-semibold text-gray-800 hover:text-sky-600 transition-colors">
                <span>{faq.q}</span>
                <motion.span className="ml-4 text-lg md:text-xl text-sky-500 group-open:rotate-180 transition-transform">
                  ▼
                </motion.span>
              </summary>
              <motion.div
                className="bg-gradient-to-r from-sky-50 to-indigo-50 border-t border-gray-100 p-4 md:p-5 text-gray-600 leading-relaxed"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.4 }}
              >
                {faq.a}
              </motion.div>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-sky-200/20 via-purple-200/20 to-indigo-200/20 rounded-2xl pointer-events-none"></div>
            </motion.details>
          ))}
        </div>
      </motion.section>

      {/* 🔐 AUTH MODAL */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  );
}
