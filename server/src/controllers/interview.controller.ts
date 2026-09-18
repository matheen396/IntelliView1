import { Request, Response } from "express";
import {
  generateInterviewQuestions,
  QuestionGenerationRequest,
} from "../services/ai.service";
import {
  seedCompanyQuestions,
  JOB_ROLES,
  COMPANIES,
} from "../services/seed.service";

/**
 * Generate interview questions based on resume and job role
 * POST /api/interview/generate-questions
 */
export const generateQuestions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      res
        .status(401)
        .json({ success: false, message: "User not authenticated" });
      return;
    }

    const { resumeId, jobRole, company, numberOfQuestions, difficultyMix } =
      req.body;

    // Validate required fields
    if (!resumeId) {
      res.status(400).json({ success: false, message: "resumeId is required" });
      return;
    }

    if (!jobRole) {
      res.status(400).json({ success: false, message: "jobRole is required" });
      return;
    }

    const request: QuestionGenerationRequest = {
      resumeId,
      jobRole,
      company,
      numberOfQuestions: numberOfQuestions || 10,
      difficultyMix: difficultyMix || { easy: 2, medium: 5, hard: 3 },
    };

    const result = await generateInterviewQuestions(request);

    res.json({
      success: true,
      message: `Generated ${result.questions.length} interview questions`,
      data: result,
    });
  } catch (error: any) {
    console.error("Question generation error:", error);

    // Handle specific errors
    if (error.message === "Resume not found") {
      res.status(404).json({ success: false, message: "Resume not found" });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Failed to generate questions",
      error: error.message,
    });
  }
};

/**
 * Get available job roles
 * GET /api/interview/job-roles
 */
export const getJobRoles = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    res.json({
      success: true,
      data: JOB_ROLES,
    });
  } catch (error: any) {
    console.error("Get job roles error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch job roles",
      error: error.message,
    });
  }
};

/**
 * Get available companies
 * GET /api/interview/companies
 */
export const getCompanies = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    res.json({
      success: true,
      data: COMPANIES,
    });
  } catch (error: any) {
    console.error("Get companies error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch companies",
      error: error.message,
    });
  }
};

/**
 * Seed company questions into vector database (Admin only)
 * POST /api/interview/seed-questions
 */
export const seedQuestions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userRole = (req as any).user?.role;

    // Allow in development or for admins
    if (process.env.NODE_ENV !== "development" && userRole !== "ADMIN") {
      res
        .status(403)
        .json({ success: false, message: "Admin access required" });
      return;
    }

    const result = await seedCompanyQuestions();

    if (!result.success) {
      res.status(500).json({
        success: false,
        message: "Failed to seed questions",
        error: result.error,
      });
      return;
    }

    res.json({
      success: true,
      message: `Successfully seeded ${result.questionsIndexed} company questions`,
      data: { questionsIndexed: result.questionsIndexed },
    });
  } catch (error: any) {
    console.error("Seed questions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to seed questions",
      error: error.message,
    });
  }
};
