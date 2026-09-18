import prisma from "../config/database";
import {
  parseResumePDF,
  createEmbeddingText,
  ParsedResume,
} from "./pdf.service";
import { indexResume, deleteResumeVector } from "./vector.service";
import { deleteFromCloudinary, getSecureUrl } from "../config/cloudinary";
import axios from "axios";

export interface UploadResumeResult {
  resume: {
    id: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    skillsExtracted: string[];
    isIndexed: boolean;
    createdAt: Date;
  };
  parsing: {
    success: boolean;
    skillsFound: number;
    sectionsExtracted: string[];
  };
  indexing: {
    success: boolean;
    vectorId?: string;
    error?: string;
  };
}

/**
 * Process and store a resume upload
 */
export const processResumeUpload = async (
  userId: string,
  file: Express.Multer.File & { path?: string; filename?: string }
): Promise<UploadResumeResult> => {
  // File is already uploaded to Cloudinary via multer-storage-cloudinary
  const fileUrl = file.path || "";
  const fileName = file.originalname;
  const fileSize = file.size;
  const mimeType = file.mimetype;

  // Create initial resume record
  const resume = await prisma.resume.create({
    data: {
      userId,
      fileName,
      fileUrl,
      fileSize,
      mimeType,
      isIndexed: false,
    },
  });

  let parsedResume: ParsedResume | null = null;
  let parsingSuccess = false;
  let indexingSuccess = false;
  let vectorId: string | undefined;
  let indexingError: string | undefined;

  try {
    // Download and parse the PDF
    const pdfBuffer = await downloadFile(fileUrl);
    parsedResume = await parseResumePDF(pdfBuffer);
    parsingSuccess = true;

    // Update resume with parsed data
    await prisma.resume.update({
      where: { id: resume.id },
      data: {
        rawText: parsedResume.rawText,
        parsedData: parsedResume as any,
        skillsExtracted: parsedResume.extractedSections.skills,
      },
    });

    // Index the resume in vector database
    try {
      const embeddingText = createEmbeddingText(parsedResume);
      vectorId = await indexResume(
        resume.id,
        userId,
        embeddingText,
        parsedResume.extractedSections.skills,
        parsedResume.extractedSections.summary
      );

      indexingSuccess = true;

      // Update resume with vector ID
      await prisma.resume.update({
        where: { id: resume.id },
        data: {
          vectorId,
          isIndexed: true,
        },
      });
    } catch (error: any) {
      console.error("Resume indexing error:", error);
      indexingError = error.message;
    }
  } catch (error: any) {
    console.error("Resume parsing error:", error);
  }

  // Fetch final resume state
  const finalResume = await prisma.resume.findUnique({
    where: { id: resume.id },
  });

  const sectionsExtracted: string[] = [];
  if (parsedResume) {
    if (parsedResume.extractedSections.skills.length > 0)
      sectionsExtracted.push("skills");
    if (parsedResume.extractedSections.experience.length > 0)
      sectionsExtracted.push("experience");
    if (parsedResume.extractedSections.education.length > 0)
      sectionsExtracted.push("education");
    if (parsedResume.extractedSections.projects.length > 0)
      sectionsExtracted.push("projects");
    if (parsedResume.extractedSections.certifications.length > 0)
      sectionsExtracted.push("certifications");
    if (parsedResume.extractedSections.summary)
      sectionsExtracted.push("summary");
  }

  return {
    resume: {
      id: finalResume!.id,
      fileName: finalResume!.fileName,
      fileUrl: finalResume!.fileUrl,
      fileSize: finalResume!.fileSize,
      skillsExtracted: finalResume!.skillsExtracted,
      isIndexed: finalResume!.isIndexed,
      createdAt: finalResume!.createdAt,
    },
    parsing: {
      success: parsingSuccess,
      skillsFound: parsedResume?.extractedSections.skills.length || 0,
      sectionsExtracted,
    },
    indexing: {
      success: indexingSuccess,
      vectorId,
      error: indexingError,
    },
  };
};

/**
 * Get all resumes for a user
 */
export const getUserResumes = async (userId: string) => {
  return prisma.resume.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      fileName: true,
      fileUrl: true,
      fileSize: true,
      skillsExtracted: true,
      isIndexed: true,
      createdAt: true,
    },
  });
};

/**
 * Get a single resume by ID
 */
export const getResumeById = async (resumeId: string, userId?: string) => {
  const where: any = { id: resumeId };
  if (userId) {
    where.userId = userId;
  }

  return prisma.resume.findFirst({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

/**
 * Delete a resume
 */
export const deleteResume = async (
  resumeId: string,
  userId: string
): Promise<boolean> => {
  const resume = await prisma.resume.findFirst({
    where: { id: resumeId, userId },
  });

  if (!resume) {
    return false;
  }

  // Delete from Cloudinary
  if (resume.fileUrl) {
    const publicId = extractPublicId(resume.fileUrl);
    if (publicId) {
      await deleteFromCloudinary(publicId, "raw");
    }
  }

  // Delete from vector database
  if (resume.vectorId) {
    await deleteResumeVector(resumeId);
  }

  // Delete from database
  await prisma.resume.delete({
    where: { id: resumeId },
  });

  return true;
};

/**
 * Get a secure download URL for a resume
 */
export const getResumeDownloadUrl = async (
  resumeId: string,
  userId: string
): Promise<string | null> => {
  const resume = await prisma.resume.findFirst({
    where: { id: resumeId, userId },
  });

  if (!resume) {
    return null;
  }

  const publicId = extractPublicId(resume.fileUrl);
  if (!publicId) {
    return resume.fileUrl; // Return original URL if can't extract public ID
  }

  return getSecureUrl(publicId, "raw", 3600); // 1 hour expiry
};

/**
 * Download file from URL to buffer
 */
const downloadFile = async (url: string): Promise<Buffer> => {
  const response = await axios.get(url, {
    responseType: "arraybuffer",
  });
  return Buffer.from(response.data);
};

/**
 * Extract Cloudinary public ID from URL
 */
const extractPublicId = (url: string): string | null => {
  try {
    // Cloudinary URLs typically follow pattern: /v{version}/{folder}/{public_id}.{format}
    const match = url.match(/\/v\d+\/(.+?)(?:\.[^.]+)?$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
};

export default {
  processResumeUpload,
  getUserResumes,
  getResumeById,
  deleteResume,
  getResumeDownloadUrl,
};
