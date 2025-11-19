import { useEffect, useState } from "react";
import { workerApi } from "../../api/workerApi.js";
import WorkerCard from "../../components/WorkerCard.jsx";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

export default function FindWorkers() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: "",
    subcategory: "",
    minRate: "",
    maxRate: "",
    q: "",
  });

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const res = await workerApi.searchWorkers(filters);
      let data = res.data?.data || [];

      // Fix: handle "Other + customCategory"
      data = data.map((w) => ({
        ...w,
        displayCategory:
          w.category?.toLowerCase() === "other" && w.customCategory
            ? `Other - ${w.customCategory}`
            : w.category || "N/A",
        location:
          w.location?.address
            ? w.location
            : { address: "Not Provided" },
      }));

      setWorkers(data);
    } catch (err) {
      console.error("❌ Failed to fetch workers:", err);
      toast.error("Unable to fetch workers. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchWorkers();
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <h2 className="text-3xl font-extrabold text-center mb-10 bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 text-transparent bg-clip-text">
        🔍 Find My Worker
      </h2>

      {/* Filter Section */}
      <form
        onSubmit={handleSearch}
        className="flex flex-wrap justify-center gap-4 mb-10"
      >
        <input
          type="text"
          name="q"
          placeholder="Search by name, skill, or category"
          value={filters.q}
          onChange={handleChange}
          className="border border-gray-300 rounded-lg px-4 py-2 w-72 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
        />
        <input
          type="text"
          name="category"
          placeholder="Category"
          value={filters.category}
          onChange={handleChange}
          className="border border-gray-300 rounded-lg px-4 py-2 w-40 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
        />
        <input
          type="text"
          name="subcategory"
          placeholder="Subcategory"
          value={filters.subcategory}
          onChange={handleChange}
          className="border border-gray-300 rounded-lg px-4 py-2 w-40 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
        />
        <input
          type="number"
          name="minRate"
          placeholder="Min Rate"
          value={filters.minRate}
          onChange={handleChange}
          className="border border-gray-300 rounded-lg px-4 py-2 w-28 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
        />
        <input
          type="number"
          name="maxRate"
          placeholder="Max Rate"
          value={filters.maxRate}
          onChange={handleChange}
          className="border border-gray-300 rounded-lg px-4 py-2 w-28 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
        />

        <button
          type="submit"
          className="bg-gradient-to-r from-indigo-500 to-sky-500 text-white px-6 py-2 rounded-lg font-semibold text-sm shadow hover:scale-105 transition-transform"
        >
          Search
        </button>
      </form>

      {/* Worker Cards */}
      {loading ? (
        <div className="flex justify-center items-center py-10 text-gray-500">
          <Loader2 className="animate-spin w-6 h-6 mr-2" /> Loading workers...
        </div>
      ) : workers.length === 0 ? (
        <p className="text-center text-gray-500 mt-8 font-medium">
          No workers found. Try different filters.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {workers.map((w, i) => (
            <WorkerCard
              key={w._id || w.user?._id || i}
              worker={w}
              showLocation
            />
          ))}
        </div>
      )}
    </div>
  );
}
