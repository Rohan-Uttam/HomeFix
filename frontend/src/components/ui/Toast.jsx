import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Toast({ message, type = "info", duration = 3000 }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (!visible) return null;

  const base =
    "fixed bottom-5 right-5 px-5 py-3 rounded-lg shadow-lg text-white font-semibold text-sm flex items-center gap-2 z-50";

  const variants = {
    success: "bg-gradient-to-r from-green-500 to-emerald-600",
    error: "bg-gradient-to-r from-red-500 to-pink-600",
    info: "bg-gradient-to-r from-sky-500 to-indigo-600",
    warning: "bg-gradient-to-r from-yellow-400 to-orange-500 text-black",
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.9 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`${base} ${variants[type]}`}
        >
          {type === "success" && "✅"}
          {type === "error" && "❌"}
          {type === "info" && "ℹ️"}
          {type === "warning" && "⚠️"} {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
