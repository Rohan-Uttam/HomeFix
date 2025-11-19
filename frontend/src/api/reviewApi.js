import api from "./axios.js";

export const reviewApi = {
  addReview: (workerId, payload) =>
    api.post(`/reviews/${workerId}`, payload), // POST /api/reviews/:workerId

  getReviews: (workerId) =>
    api.get(`/reviews/${workerId}`), // GET /api/reviews/:workerId

  getJobReviews: (jobId) =>
    api.get(`/reviews/job/${jobId}`), // GET /api/reviews/job/:jobId
};
