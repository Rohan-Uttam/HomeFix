export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center space-x-3 mt-8">
      {/* Prev Button */}
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className={`px-4 py-2 rounded-full text-sm font-semibold shadow-md transition-all duration-300
          ${
            currentPage === 1
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-sky-500 via-purple-500 to-pink-500 text-white hover:scale-110 hover:shadow-lg"
          }`}
      >
        ⬅ Prev
      </button>

      {/* Page Info */}
      <span className="px-4 py-2 text-sm font-semibold text-gray-800 bg-gray-100 rounded-full shadow">
        Page {currentPage} of {totalPages}
      </span>

      {/* Next Button */}
      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className={`px-4 py-2 rounded-full text-sm font-semibold shadow-md transition-all duration-300
          ${
            currentPage === totalPages
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-pink-500 via-purple-500 to-sky-500 text-white hover:scale-110 hover:shadow-lg"
          }`}
      >
        Next ➡
      </button>
    </div>
  );
}
