import { Router } from "express";
import { uploadResume } from "../config/cloudinary";
import {
  uploadResume as uploadResumeController,
  getMyResumes,
  getResume,
  removeResume,
  downloadResume,
} from "../controllers/resume.controller";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   POST /api/resumes/upload
 * @desc    Upload a new resume (PDF only)
 * @access  Private
 */
router.post("/upload", uploadResume.single("resume"), uploadResumeController);

/**
 * @route   GET /api/resumes
 * @desc    Get all resumes for the authenticated user
 * @access  Private
 */
router.get("/", getMyResumes);

/**
 * @route   GET /api/resumes/:id
 * @desc    Get a specific resume by ID
 * @access  Private
 */
router.get("/:id", getResume);

/**
 * @route   DELETE /api/resumes/:id
 * @desc    Delete a resume
 * @access  Private
 */
router.delete("/:id", removeResume);

/**
 * @route   GET /api/resumes/:id/download
 * @desc    Get a secure download URL for a resume
 * @access  Private
 */
router.get("/:id/download", downloadResume);

export default router;
