import { useState } from "react";
import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import { recommendApi } from "../../api/recommendApi.js";
import { jobApi } from "../../api/jobApi.js"; 
import getUserLocation from "../../utils/location.js";
import RecommendationCard from "../../components/RecommendationCard.jsx";
import toast from "react-hot-toast";

export default function JobRequest() {
  const [form, setForm] = useState({
    service: "",
    description: "",
    date: "",
    location: "",
    price: "",
    worker: "",
  });
  const [recommendations, setRecommendations] = useState([]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const coords = await getUserLocation();

      if (form.worker && form.service && form.date && form.price) {
        const res = await jobApi.create({
          service: form.service,
          description: form.description,
          scheduledDate: form.date,
          price: Number(form.price),
          worker: form.worker,
        });

        toast.success("🎉 Job created successfully!");
        console.log("Job Created:", res.data?.data);
      } else {
        toast("👉 Please select worker, service, date and price!");
      }

      const rec = await recommendApi.recommendWorkers({
        category: form.service,
        skills: form.description
          ? form.description.split(" ").slice(0, 3)
          : [],
        clientCoords: coords,
      });

      setRecommendations(rec.data?.data || []);
      toast.success("Smart recommendations ready!");
    } catch (err) {
      console.error("Job Request error:", err);
      toast.error("Failed to request job");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4">
      <Card className="p-6 shadow-lg">
        <h2 className="text-3xl font-extrabold text-center mb-6 bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
          🛠️ Request a Job
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="service"
            placeholder="Service Needed (e.g. Plumber)"
            value={form.service}
            onChange={handleChange}
            className="input"
            required
          />
          <textarea
            name="description"
            placeholder="Job Description"
            value={form.description}
            onChange={handleChange}
            className="input"
          />
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="input"
            required
          />
          <input
            type="number"
            name="price"
            placeholder="Estimated Price"
            value={form.price}
            onChange={handleChange}
            className="input"
            required
          />
          <input
            type="text"
            name="location"
            placeholder="Location"
            value={form.location}
            onChange={handleChange}
            className="input"
          />

          {/* Worker select */}
          <select
            name="worker"
            value={form.worker}
            onChange={handleChange}
            className="input"
            required
          >
            <option value="">Select Worker</option>
            {recommendations.map((w) => (
              <option key={w.workerId} value={w.workerId}>
                {w.name} – ⭐ {w.rating || 0}
              </option>
            ))}
          </select>

          <Button
            type="submit"
            variant="primary"
            className="w-full py-2 font-semibold shadow-md hover:scale-[1.02] transition-transform"
          >
            🚀 Submit Request
          </Button>
        </form>
      </Card>

      {recommendations.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4 text-sky-700 flex items-center gap-2">
            🔥 Recommended Workers for You
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {recommendations.map((w) => (
              <RecommendationCard key={w.workerId} worker={w} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
