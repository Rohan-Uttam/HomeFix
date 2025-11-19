import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const fileUrl = `${process.env.BASE_URL || "http://localhost:5000"}/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

export default router;
