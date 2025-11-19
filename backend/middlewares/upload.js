import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js"; // should export configured cloudinary v2
import path from "path";

// Cloudinary storage engine
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "homeservices",
    allowed_formats: ["jpg", "jpeg", "png", "gif"],
    transformation: [{ width: 400, height: 400, crop: "fill" }],
  },
});

// File filter (images only)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed!"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // max 2MB
});

export default upload;
