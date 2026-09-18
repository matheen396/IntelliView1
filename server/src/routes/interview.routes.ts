import { Router } from "express";
import {
  generateQuestions,
  getJobRoles,
  getCompanies,
  seedQuestions,
} from "../controllers/interview.controller";
import { authenticateToken } from "../middleware/auth";

const router = Router();

/**
 * @route   GET /api/interview/job-roles
 * @desc    Get available job roles for interview
 * @access  Public
 */
router.get("/job-roles", getJobRoles);

/**
 * @route   GET /api/interview/companies
 * @desc    Get available companies
 * @access  Public
 */
router.get("/companies", getCompanies);

/**
 * @route   POST /api/interview/generate-questions
 * @desc    Generate interview questions based on resume and job role
 * @access  Private
 */
router.post("/generate-questions", authenticateToken, generateQuestions);

/**
 * @route   POST /api/interview/seed-questions
 * @desc    Seed company questions into vector database (Admin/Dev only)
 * @access  Private (Admin)
 */
router.post("/seed-questions", authenticateToken, seedQuestions);

export default router;
