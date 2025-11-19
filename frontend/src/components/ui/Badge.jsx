export default function Badge({ children, variant = "default", className = "" }) {
  const base =
    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold shadow-sm";

  const variants = {
    default:
      "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-300",
    success:
      "bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300",
    warning:
      "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300",
    danger:
      "bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300",
    info:
      "bg-gradient-to-r from-sky-100 to-indigo-100 text-sky-800 border border-sky-300",
  };

  return (
    <span
      className={`${base} ${variants[variant] || variants.default} ${className}`}
    >
      {children}
    </span>
  );
}
