import express from "express";
const router = express.Router();
import {
  getProjects,
  createProject,
  getProjectBySlug,
  getProjectById,
  updateProject,
  deleteProject,
} from "../controllers/projectController.js";
// Import your auth middleware (e.g., protect, admin)
// import { protect, admin } from '../middleware/authMiddleware.js';

router.route("/").get(getProjects).post(createProject); // Add protect/admin middleware here later
router.route("/slug/:slug").get(getProjectBySlug); // Add protect/admin middleware here later
router
  .route("/:id")
  .get(getProjectById)
  .put(updateProject)
  .delete(deleteProject); // Add protect/admin middleware here later

export default router;
