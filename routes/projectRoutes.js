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
import upload from "../middlewares/multer.js";
// Import your auth middleware (e.g., protect, admin)
// import { protect, admin } from '../middleware/authMiddleware.js';

const projectUpload = upload.fields([{ name: "images", maxCount: 25 }]);

router.route("/").get(getProjects).post(projectUpload, createProject);
router.route("/slug/:slug").get(getProjectBySlug);
router
  .route("/:id")
  .get(getProjectById)
  .put(projectUpload, updateProject)
  .delete(deleteProject);

export default router;
