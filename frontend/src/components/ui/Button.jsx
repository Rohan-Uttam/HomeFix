import { motion } from "framer-motion";
import ClipLoader from "react-spinners/ClipLoader";

export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  className = "",
  disabled = false,
  loading = false,
}) {
  const base =
    "relative px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 " +
    "transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none";

  const variants = {
    primary:
      "bg-gradient-to-r from-sky-600 to-indigo-600 text-white " +
      "hover:from-sky-700 hover:to-indigo-700 " +
      "shadow-md hover:shadow-lg focus:ring-2 focus:ring-sky-400",
    secondary:
      "bg-gray-100 text-gray-800 hover:bg-gray-200 " +
      "shadow-sm hover:shadow-md focus:ring-2 focus:ring-gray-300",
    danger:
      "bg-gradient-to-r from-red-500 to-red-600 text-white " +
      "hover:from-red-600 hover:to-red-700 " +
      "shadow-md hover:shadow-lg focus:ring-2 focus:ring-red-400",
  };

  return (
    <motion.button
      whileHover={!disabled && !loading ? { scale: 1.04 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.96 } : {}}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {loading ? <ClipLoader size={18} color="#fff" /> : children}
    </motion.button>
  );
}
