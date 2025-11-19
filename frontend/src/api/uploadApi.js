// frontend/src/api/uploadApi.js
import api from "./axios.js";

export const uploadApi = {
  upload: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
