import { motion } from "framer-motion";

export default function Card({ children, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{
        scale: 1.02,
        boxShadow: "0px 12px 28px rgba(0,0,0,0.15)",
      }}
      className={`bg-white rounded-2xl shadow-md p-6 
                  transition-all duration-500 ease-in-out
                  hover:bg-gradient-to-br hover:from-sky-50 hover:via-indigo-50 hover:to-blue-50
                  border border-gray-100/80
                  h-full min-h-[200px] ${className}`}
      style={{
        transitionProperty: "transform, box-shadow, background-color, border-color",
      }}
    >
      {children}
    </motion.div>
  );
}
