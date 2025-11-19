import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext.jsx";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthModal({ onClose }) {
  const navigate = useNavigate();
  const { user } = useAppContext();

  if (user) return null; // Agar already logged in hai → modal mat dikhao

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 flex items-center justify-center 
                   bg-black bg-opacity-50 backdrop-blur-sm z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Centered Modal Card */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 30 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative bg-white/90 backdrop-blur-xl p-8 rounded-2xl shadow-2xl 
                     max-w-sm w-full border border-white/30
                     max-h-[90vh] overflow-y-auto"
        >
          {/* 🔹 Gradient Top Border */}
          <div className="absolute top-0 left-0 w-full h-1 
                          bg-gradient-to-r from-sky-500 via-purple-500 to-pink-500 rounded-t-2xl" />

          {/* Title */}
          <h2 className="text-2xl font-extrabold mb-3 text-transparent bg-clip-text 
                         bg-gradient-to-r from-sky-500 to-pink-500">
            Get Started
          </h2>
          <p className="text-gray-600 mb-6 text-sm">
            Choose how you want to continue:
          </p>

          {/* Buttons */}
          <div className="space-y-4">
            <button
              onClick={() => {
                onClose();
                navigate("/register"); // Client Register
              }}
              className="w-full py-3 rounded-lg font-semibold text-white 
                         bg-gradient-to-r from-sky-500 to-purple-600 
                         shadow-md hover:opacity-90 transition-all transform hover:scale-[1.02]"
            >
              Register as Client
            </button>

            <button
              onClick={() => {
                onClose();
                navigate("/register/worker");// Worker Register
              }}
              className="w-full py-3 rounded-lg font-semibold text-white 
                         bg-gradient-to-r from-purple-500 to-pink-500 
                         shadow-md hover:opacity-90 transition-all transform hover:scale-[1.02]"
            >
              Register as Worker
            </button>

            <button
              onClick={() => {
                onClose();
                navigate("/login");
              }}
              className="w-full py-3 rounded-lg font-semibold border border-gray-300 text-gray-700 
                         hover:bg-gray-100 transition-all"
            >
              Login
            </button>
          </div>

          {/* Cancel */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={onClose}
              className="text-sm text-gray-500 hover:text-gray-700 transition"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
