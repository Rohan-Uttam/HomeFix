// backend/routes/categoryRoutes.js
import express from "express";
import { getCategories } from "../controllers/categoryController.js";

const router = express.Router();

/**
 * @route GET /api/categories
 * @desc Get all categories + subcategories
 */
router.get("/", getCategories);

export default router;
