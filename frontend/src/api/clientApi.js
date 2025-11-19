import api from "./axios";

export const clientApi = {
  searchWorkers: (filters) => api.post("/clients/search", filters),
  myJobs: () => api.get("/clients/my-jobs"),
  requestJob: (data) => api.post("/clients/job-request", data),
};
