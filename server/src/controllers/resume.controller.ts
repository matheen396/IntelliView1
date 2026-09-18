import { Request, Response } from "express";
import {
  processResumeUpload,
  getUserResumes,
  getResumeById,
  deleteResume,
  getResumeDownloadUrl,
} from "../services/resume.service";

/**
 * Upload a new resume
 * POST /api/resumes/upload
 */
export const uploadResume = async (
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

    if (!req.file) {
      res.status(400).json({ success: false, message: "No file uploaded" });
      return;
    }

    const result = await processResumeUpload(
      userId,
      req.file as Express.Multer.File & { path?: string }
    );

    res.status(201).json({
      success: true,
      message: "Resume uploaded and processed successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Resume upload error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload resume",
      error: error.message,
    });
  }
};

/**
 * Get all resumes for the authenticated user
 * GET /api/resumes
 */
export const getMyResumes = async (
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

    const resumes = await getUserResumes(userId);

    res.json({
      success: true,
      data: resumes,
    });
  } catch (error: any) {
    console.error("Get resumes error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch resumes",
      error: error.message,
    });
  }
};

/**
 * Get a specific resume by ID
 * GET /api/resumes/:id
 */
export const getResume = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;

    if (!userId) {
      res
        .status(401)
        .json({ success: false, message: "User not authenticated" });
      return;
    }

    const resume = await getResumeById(id, userId);

    if (!resume) {
      res.status(404).json({ success: false, message: "Resume not found" });
      return;
    }

    res.json({
      success: true,
      data: resume,
    });
  } catch (error: any) {
    console.error("Get resume error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch resume",
      error: error.message,
    });
  }
};

/**
 * Delete a resume
 * DELETE /api/resumes/:id
 */
export const removeResume = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;

    if (!userId) {
      res
        .status(401)
        .json({ success: false, message: "User not authenticated" });
      return;
    }

    const deleted = await deleteResume(id, userId);

    if (!deleted) {
      res.status(404).json({ success: false, message: "Resume not found" });
      return;
    }

    res.json({
      success: true,
      message: "Resume deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete resume error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete resume",
      error: error.message,
    });
  }
};

/**
 * Get a secure download URL for a resume
 * GET /api/resumes/:id/download
 */
export const downloadResume = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;

    if (!userId) {
      res
        .status(401)
        .json({ success: false, message: "User not authenticated" });
      return;
    }

    const downloadUrl = await getResumeDownloadUrl(id, userId);

    if (!downloadUrl) {
      res.status(404).json({ success: false, message: "Resume not found" });
      return;
    }

    res.json({
      success: true,
      data: { downloadUrl },
    });
  } catch (error: any) {
    console.error("Download resume error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate download URL",
      error: error.message,
    });
  }
};
