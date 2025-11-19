// src/components/ui/LoadingButton.jsx
import { useState } from "react";

export default function LoadingButton({
  onClick,
  children,
  className = "",
  disabled = false,
}) {
  const [loading, setLoading] = useState(false);

  const handleClick = async (e) => {
    if (loading) return; // Prevent double click
    setLoading(true);
    try {
      await onClick(e); // Wait for parent action to complete
    } catch (err) {
      console.error("Button action failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading || disabled}
      className={`relative flex items-center justify-center px-4 py-2 rounded-md font-medium transition-all duration-200 ${
        loading
          ? "bg-gray-400 cursor-not-allowed opacity-70"
          : "bg-blue-600 hover:bg-blue-700 text-white"
      } ${className}`}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin h-4 w-4 mr-2 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            ></path>
          </svg>
          Processing...
        </>
      ) : (
        children
      )}
    </button>
  );
}
