import { X, CheckCircle, AlertTriangle, Info, XCircle } from "lucide-react";

export default function Alert({ 
  title, 
  message, 
  variant = "info", 
  onClose 
}) {
  const variants = {
    success: {
      container: "bg-gradient-to-r from-green-50 to-green-100 border-green-300 text-green-800",
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
    },
    danger: {
      container: "bg-gradient-to-r from-red-50 to-red-100 border-red-300 text-red-800",
      icon: <XCircle className="w-5 h-5 text-red-600" />,
    },
    warning: {
      container: "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300 text-yellow-800",
      icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
    },
    info: {
      container: "bg-gradient-to-r from-sky-50 to-indigo-50 border-sky-300 text-sky-800",
      icon: <Info className="w-5 h-5 text-sky-600" />,
    },
  };

  const { container, icon } = variants[variant] || variants.info;

  return (
    <div
      className={`flex items-start gap-3 border rounded-xl p-4 shadow-sm animate-fade-in ${container}`}
    >
      {/* Icon */}
      <div className="mt-0.5">{icon}</div>

      {/* Content */}
      <div className="flex-1">
        {title && <h4 className="font-semibold text-sm">{title}</h4>}
        {message && <p className="text-sm opacity-90">{message}</p>}
      </div>

      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="text-sm text-gray-500 hover:text-gray-700 rounded-full p-1 transition-colors"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
