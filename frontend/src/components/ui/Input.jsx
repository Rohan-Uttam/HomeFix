import { motion, AnimatePresence } from "framer-motion";

export default function Input({
  label,
  type = "text",
  className = "",
  error,
  iconLeft,
  iconRight,
  ...props
}) {
  return (
    <div className="space-y-1 w-full">
      {/* Label */}
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}

      {/* Input wrapper with optional icons */}
      <div className="relative">
        {iconLeft && (
          <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">
            {iconLeft}
          </span>
        )}

        <input
          type={type}
          className={`w-full px-3 py-2 rounded-lg border border-gray-300 
            bg-white shadow-sm
            focus:ring-2 focus:ring-sky-500 focus:border-sky-500 
            focus:shadow-md transition-all duration-200
            ${iconLeft ? "pl-10" : ""} 
            ${iconRight ? "pr-10" : ""} 
            ${className}`}
          {...props}
        />

        {iconRight && (
          <span className="absolute inset-y-0 right-3 flex items-center text-gray-400">
            {iconRight}
          </span>
        )}
      </div>

      {/* Error with animation */}
      <AnimatePresence>
        {error && (
          <motion.p
            className="text-xs text-red-500"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
