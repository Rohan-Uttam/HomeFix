import api from "./api.js";

export const jobApi = {
  create: (data) => api.post("/jobs", data),
  updateStatus: (id, status) => api.put(`/jobs/${id}/status`, { status }),
  myJobs: () => api.get("/jobs/mine"),
};
