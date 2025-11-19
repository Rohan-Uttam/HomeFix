// src/pages/Client/ClientDashboard.jsx
import { useEffect, useState } from "react";
import SearchForm from "../../components/SearchForm.jsx";
import WorkerCard from "../../components/WorkerCard.jsx";
import api from "../../api/axios.js";
import { useAppContext } from "../../context/AppContext.jsx";
import toast from "react-hot-toast";

export default function ClientDashboard() {
  const { user } = useAppContext();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWorkers = async () => {
      setLoading(true);
      try {
        const res = await api.get("/workers/search");
        const data = Array.isArray(res.data?.data) ? res.data.data : [];

        // keep raw worker objects - WorkerCard will determine displayCategory
        setWorkers(data);
      } catch (err) {
        console.error("Failed to fetch workers:", err?.response?.data || err?.message);
        toast.error("Failed to load workers");
      } finally {
        setLoading(false);
      }
    };
    loadWorkers();
  }, []);

  // Restrict access to clients
  if (!user || user.role !== "client") {
    return (
      <p className="text-center mt-16 text-gray-600 font-medium text-lg">
        ⚠️ Only clients can view this page.
      </p>
    );
  }

  // handle search (nearby or filtered)
  const handleSearch = async (filters) => {
    setLoading(true);
    try {
      const endpoint = filters?.nearby ? "/workers/nearby" : "/workers/search";
      const res = await api.get(endpoint, { params: filters });
      const data = Array.isArray(res.data?.data) ? res.data.data : [];

      setWorkers(data);
      if (!data.length) toast.error("No workers found");
    } catch (err) {
      console.error("Search failed:", err?.response?.data || err?.message);
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-sky-500 via-purple-500 to-pink-500 text-white py-20 shadow-xl relative overflow-hidden rounded-b-3xl">
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
        <div className="relative container mx-auto text-center px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-lg">
            Find Trusted{" "}
            <span className="text-yellow-300">Home Experts 🏡</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-100 max-w-2xl mx-auto">
            Hire plumbers, electricians, carpenters and more — all verified and
            ready to help you anytime, anywhere.
          </p>
        </div>
      </section>

      {/* Search Section */}
      <div className="container mx-auto mt-12 px-4">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center bg-gradient-to-r from-sky-500 to-purple-600 bg-clip-text text-transparent">
          🔎 Search for Services
        </h2>

        <div className="mb-10 max-w-3xl mx-auto">
          <SearchForm onSearch={handleSearch} />
        </div>

        {/* Worker Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-sky-500"></div>
            <p className="mt-6 text-gray-600 font-medium">
              🔎 Finding workers near you...
            </p>
          </div>
        ) : workers.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg font-semibold">
              🙁 No workers found
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Try adjusting your filters or expanding the radius
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {workers.map((worker, idx) => (
              <WorkerCard
                key={worker._id ?? worker.user?._id ?? idx}
                worker={worker}
                showLocation
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
