import { Link } from "react-router-dom";
import {
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaEnvelope,
  FaPhoneAlt,
  FaArrowUp,
} from "react-icons/fa";
import { motion } from "framer-motion";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black text-gray-300 mt-auto overflow-hidden">
      {/* Subtle animated gradient shimmer */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-sky-500/10 via-purple-500/10 to-pink-500/10"
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        style={{ backgroundSize: "200% 200%" }}
      />

      <div className="relative max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 z-10">
        {/* 🔹 Brand */}
        <div>
          <h3 className="text-2xl font-extrabold text-white mb-3">
            Home<span className="text-sky-400">Services</span>
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Connecting clients with trusted workers — plumbers, electricians,
            carpenters, and more. Anytime, anywhere. 🏠
          </p>
        </div>

        {/* 🔹 Quick Links */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            {[
              { to: "/", label: "Home" },
              { to: "/client/dashboard", label: "Find Workers" },
              { to: "/client/bookings", label: "My Bookings" },
              { to: "/login", label: "Login / Register" },
            ].map((link, idx) => (
              <li key={idx}>
                <Link
                  to={link.to}
                  className="relative inline-block hover:text-sky-400 transition group"
                >
                  {link.label}
                  <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-gradient-to-r from-sky-400 via-purple-400 to-pink-400 transition-all duration-500 group-hover:w-full"></span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* 🔹 Contact */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-3">Contact</h4>
          <p className="flex items-center gap-2 text-sm mb-2 hover:text-sky-400 transition">
            <FaEnvelope className="text-sky-400" /> support@homeservices.com
          </p>
          <p className="flex items-center gap-2 text-sm hover:text-sky-400 transition">
            <FaPhoneAlt className="text-sky-400" /> +91 8953010920
          </p>
        </div>

        {/* 🔹 Social Links */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-3">
            Connect With Us
          </h4>
          <div className="flex gap-4">
            {[
              {
                href: "https://facebook.com",
                icon: <FaFacebook />,
                gradient: "from-sky-500 to-blue-600",
              },
              {
                href: "https://twitter.com",
                icon: <FaTwitter />,
                gradient: "from-sky-400 to-cyan-500",
              },
              {
                href: "https://linkedin.com",
                icon: <FaLinkedin />,
                gradient: "from-blue-500 to-indigo-600",
              },
            ].map((social, idx) => (
              <motion.a
                key={idx}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300 }}
                className={`w-10 h-10 flex items-center justify-center rounded-full bg-gray-700 text-white shadow-md hover:bg-gradient-to-r ${social.gradient} transition`}
              >
                {social.icon}
              </motion.a>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <motion.button
  onClick={scrollToTop}
  whileHover={{ scale: 1.15 }}
  whileTap={{ scale: 0.9 }}
  className="fixed bottom-8 right-8 w-12 h-12 rounded-full bg-gradient-to-r from-sky-500 via-purple-500 to-pink-500 text-white shadow-xl flex items-center justify-center hover:opacity-90 transition z-50"
>
  <FaArrowUp />
</motion.button>

      {/* Bottom Bar */}
      <div className="relative border-t border-gray-700 text-center py-4 text-sm text-gray-500 z-10">
        © {new Date().getFullYear()}{" "}
        <span className="text-sky-400 font-semibold">HomeServices</span>. Built
        with ❤️
      </div>
    </footer>
  );
}
