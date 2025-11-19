import { useState } from "react";
import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";

export default function JobRequestCustom() {
  const [form, setForm] = useState({
    service: "",
    customService: "",
    description: "",
    date: "",
    location: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      service: form.service === "other" ? "other" : form.service,
      customService: form.service === "other" ? form.customService : undefined,
    };

    alert(`Job Request Created: ${JSON.stringify(payload, null, 2)}`);

    setForm({
      service: "",
      customService: "",
      description: "",
      date: "",
      location: "",
    });
  };

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <h2 className="text-2xl font-bold mb-4 text-center">Request a Job</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            name="service"
            value={form.service}
            onChange={handleChange}
            className="input"
          >
            <option value="">Select Service</option>
            <option value="plumbing">Plumbing</option>
            <option value="electrician">Electrician</option>
            <option value="carpentry">Carpentry</option>
            <option value="other">Other</option>
          </select>

          {form.service === "other" && (
            <input
              type="text"
              name="customService"
              placeholder="Enter Custom Service"
              value={form.customService}
              onChange={handleChange}
              className="input"
            />
          )}

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
          />

          <input
            type="text"
            name="location"
            placeholder="Location"
            value={form.location}
            onChange={handleChange}
            className="input"
          />

          <Button type="submit" variant="primary" className="w-full">
           🚀 Submit Request
          </Button>
        </form>
      </Card>
    </div>
  );
}
