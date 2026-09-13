import express from "express";
import {
  createEnquiry,
  getAllEnquiries,
  updateEnquiryStatus,
} from "../controllers/enquiryController.js";

const router = express.Router();

router.post("/", createEnquiry);
router.get("/", getAllEnquiries);
router.patch("/:id", updateEnquiryStatus);

export default router;
