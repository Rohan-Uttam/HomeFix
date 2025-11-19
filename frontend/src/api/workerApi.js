// frontend/src/api/workerApi.js
import api from "./axios";

//  Add filters support in getAll
export const workerApi = {
  getAll: (filters = {}) => api.get("/workers", { params: filters }),
  getById: (id) => api.get(`/workers/${id}`),
  updateProfile: (data) => api.put("/workers/profile", data),
};

export default workerApi;
