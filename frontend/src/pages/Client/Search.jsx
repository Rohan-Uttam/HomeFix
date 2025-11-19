// frontend/src/pages/Client/Search.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import WorkerCard from "../../components/WorkerCard.jsx";
import SearchForm from "../../components/SearchForm.jsx";
import api from "../../api/axios.js";

export default function Search() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (filters) => {
    setLoading(true);
    console.log("📤 Sending search filters:", filters);

    try {
      const res = await api.get("/workers/search", { params: filters });
      console.log("🔎 API Response:", res.data);

      const data = res.data?.data ?? [];

      if (Array.isArray(data) && data.length === 0) {
        console.log("ℹ️ No workers found → CTA button dikhayenge");
        setWorkers([]);
        return;
      }

      if (Array.isArray(data)) {
        setWorkers(data);
      } else {
        console.warn("⚠️ Unexpected data format:", data);
        setWorkers([]);
      }
    } catch (err) {
      console.error("❌ Search failed:", err.response?.data || err.message);
      alert("Search failed, please try again later");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Heading */}
      <h2 className="text-3xl md:text-4xl font-extrabold mb-10 text-center">
        🔎 Search for{" "}
        <span className="bg-gradient-to-r from-sky-500 to-indigo-600 bg-clip-text text-transparent">
          Services
        </span>
      </h2>

      {/* Search Form */}
      <div className="mb-10">
        <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300">
          <SearchForm onSearch={handleSearch} />
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <p className="text-center text-lg font-medium text-gray-600">
          ⏳ Searching...
        </p>
      ) : workers.length === 0 ? (
        <div className="flex flex-col items-center text-center mt-12 bg-gray-50 border rounded-xl p-10 shadow">
          <p className="text-gray-500 mb-2 text-lg">No results found</p>
          <p className="text-gray-600 mb-6 max-w-sm">
            Can’t find the right worker? Post your own job request 👇
          </p>
          <button
            onClick={() => navigate("/job-request")}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-lg shadow-md hover:from-green-600 hover:to-emerald-700 transition-transform duration-300 hover:scale-105 text-lg font-semibold"
          >
            📝 Post a Job Request
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {workers.map((worker, idx) => (
            <WorkerCard
              key={worker._id ?? worker.user?._id ?? idx}
              worker={worker}
              showLocation={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
