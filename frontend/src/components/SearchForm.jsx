// frontend/src/components/SearchForm.jsx
import { useEffect, useState } from "react";
import Button from "./ui/Button.jsx";
import api from "../api/axios.js";
import getUserLocation from "../utils/location.js";
import toast from "react-hot-toast";

export default function SearchForm({ onSearch, initial = {} }) {
  const [query, setQuery] = useState(initial.query || "");
  const [category, setCategory] = useState(initial.category || "");
  const [customCategory, setCustomCategory] = useState(initial.customCategory || "");
  const [subcategory, setSubcategory] = useState(initial.subcategory || "");
  const [location, setLocation] = useState(initial.location || "");
  const [minRate, setMinRate] = useState(initial.minRate || "");
  const [maxRate, setMaxRate] = useState(initial.maxRate || "");
  const [sort, setSort] = useState(initial.sort || "");

  const [categories, setCategories] = useState([]);
  const [subcats, setSubcats] = useState([]);

  // 📌 Fetch categories
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/categories");
        let cats = res.data.data || [];
        cats.push({ key: "other", label: "Other", subcategories: [] });
        setCategories(cats);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    })();
  }, []);

  // 📌 Update subcategories
  useEffect(() => {
    if (category === "other") {
      setSubcats([]);
      setSubcategory("");
    } else {
      const cat = categories.find((c) => c.key === category);
      setSubcats(cat ? cat.subcategories : []);
      setSubcategory("");
    }
  }, [category, categories]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({
        q: query?.trim() || undefined,
        category: category || undefined,
        customCategory: category === "other" ? customCategory?.trim() : undefined,
        subcategory: category === "other" ? undefined : subcategory || undefined,
        location: location?.trim() || undefined,
        minRate: minRate ? Number(minRate) : undefined,
        maxRate: maxRate ? Number(maxRate) : undefined,
        sort: sort || undefined,
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="backdrop-blur-md bg-white/80 shadow-2xl rounded-2xl p-8 border border-sky-100 
                 transition hover:shadow-sky-200/70 animate-fade-in"
    >
      {/* Title */}
      <div className="text-center mb-6">
        <h3 className="text-3xl font-extrabold bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center justify-center gap-2">
          🔍 Find <span>Workers</span>
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Search and filter to connect with the right expert for your task
        </p>
      </div>

      {/* Row 1: Search + Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5">
        <input
          type="text"
          placeholder="Search by name, skill or keyword..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border border-gray-300 rounded-xl px-4 py-2 text-sm shadow-sm 
                     focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all 
                     hover:shadow-md w-full lg:col-span-2"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-gray-300 rounded-xl px-3 py-2 text-sm shadow-sm 
                     focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all 
                     hover:shadow-md w-full"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </select>

        {category === "other" ? (
          <input
            type="text"
            placeholder="Enter Custom Category"
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
            className="border border-gray-300 rounded-xl px-3 py-2 text-sm shadow-sm 
                       focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all 
                       hover:shadow-md w-full"
          />
        ) : (
          <select
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            disabled={!subcats.length}
            className="border border-gray-300 rounded-xl px-3 py-2 text-sm shadow-sm disabled:bg-gray-100 
                       focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all 
                       hover:shadow-md w-full"
          >
            <option value="">All Subcategories</option>
            {subcats.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        )}

        <input
          type="text"
          placeholder="Location (city / area)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="border border-gray-300 rounded-xl px-3 py-2 text-sm shadow-sm 
                     focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all 
                     hover:shadow-md w-full"
        />
      </div>

      {/* Divider */}
      <div className="my-6 border-t border-gray-200"></div>

      {/* Row 2: Rates + Sorting */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5">
        <input
          type="number"
          placeholder="Min rate (₹)"
          value={minRate}
          onChange={(e) => setMinRate(e.target.value)}
          className="border border-gray-300 rounded-xl px-3 py-2 text-sm shadow-sm 
                     focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all 
                     hover:shadow-md w-full"
        />
        <input
          type="number"
          placeholder="Max rate (₹)"
          value={maxRate}
          onChange={(e) => setMaxRate(e.target.value)}
          className="border border-gray-300 rounded-xl px-3 py-2 text-sm shadow-sm 
                     focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all 
                     hover:shadow-md w-full"
        />

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="lg:col-span-2 border border-gray-300 rounded-xl px-3 py-2 text-sm shadow-sm 
                     focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all 
                     hover:shadow-md w-full"
        >
          <option value="">Sort (default)</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
          <option value="rating_desc">Rating: High → Low</option>
          <option value="rating_asc">Rating: Low → High</option>
        </select>

        {/* Buttons */}
        <div className="lg:col-span-2 flex flex-col sm:flex-row gap-4 w-full">
          <Button
            type="submit"
            variant="primary"
            className="flex-1 px-6 py-2 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 
                       text-white text-sm font-semibold shadow hover:scale-[1.07] hover:shadow-lg 
                       hover:from-sky-600 hover:to-indigo-700 transition-all w-full"
          >
            🚀 Search
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={async () => {
              try {
                const loadingToast = toast.loading("📍 Searching nearby workers...");
                const { lat, lng, address } = await getUserLocation(true);

                if (onSearch) {
                  await onSearch({
                    q: query?.trim() || undefined,
                    category: category || undefined,
                    customCategory: category === "other" ? customCategory?.trim() : undefined,
                    subcategory: category === "other" ? undefined : subcategory || undefined,
                    minRate: minRate ? Number(minRate) : undefined,
                    maxRate: maxRate ? Number(maxRate) : undefined,
                    sort: sort || undefined,
                    lat,
                    lng,
                    radius: 5000,
                    nearby: true,
                    address: address || "",
                  });
                }

                toast.success("Showing workers near you", { id: loadingToast });
              } catch (err) {
                console.error("Location error:", err);
                toast.error("❌ Unable to fetch your location");
              }
            }}
            className="flex-1 px-6 py-2 rounded-xl border border-sky-500 text-sky-600 text-sm font-semibold 
                       hover:bg-sky-50 hover:text-sky-700 hover:scale-[1.07] hover:shadow-md 
                       transition-all w-full flex items-center justify-center gap-2"
          >
            <span>📍 Nearby</span>
          </Button>
        </div>
      </div>
    </form>
  );
}
