import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      <h1 className="text-6xl font-bold text-sky-600 mb-4">404</h1>
      <p className="text-lg text-gray-600 mb-6">Oops! Page not found.</p>
      <Link
        to="/"
        className="bg-sky-600 text-white px-6 py-3 rounded-lg hover:bg-sky-700 transition"
      >
        Back to Home
      </Link>
    </div>
  );
}
