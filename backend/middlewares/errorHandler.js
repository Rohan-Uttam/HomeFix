// backend/middlewares/errorHandler.js
export const notFound = (req, res, next) => {
  res.status(404).json({ success: false, message: "Not Found" });
};

export const errorHandler = (err, req, res, next) => {
  console.error("🔥 Server Error:", err && err.stack ? err.stack : err);
  const status = err?.status || 500;
  const message = err?.message || "Internal Server Error";
  res.status(status).json({ success: false, message });
};
