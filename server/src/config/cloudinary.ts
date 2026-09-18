import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage configuration for resumes (PDFs)
const resumeStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const userId = (req as any).user?.id || "anonymous";
    const timestamp = Date.now();
    const uniqueFilename = `${userId}_${timestamp}_${file.originalname.replace(
      /\.[^/.]+$/,
      ""
    )}`;

    return {
      folder: "intelliview/resumes",
      resource_type: "raw", // For PDFs and other documents
      public_id: uniqueFilename,
      allowed_formats: ["pdf"],
      access_mode: "authenticated", // Secure access
      type: "upload",
    };
  },
});

// Storage configuration for videos
const videoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const userId = (req as any).user?.id || "anonymous";
    const interviewId = (req as any).params?.interviewId || "unknown";
    const timestamp = Date.now();

    return {
      folder: "intelliview/videos",
      resource_type: "video",
      public_id: `${userId}_${interviewId}_${timestamp}`,
      allowed_formats: ["mp4", "webm", "mov"],
      access_mode: "authenticated",
      eager: [
        { streaming_profile: "sd", format: "m3u8" }, // HLS streaming
      ],
    };
  },
});

// Multer upload configurations
export const uploadResume = multer({
  storage: resumeStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed for resumes"));
    }
  },
});

export const uploadVideo = multer({
  storage: videoStorage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit for videos
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["video/mp4", "video/webm", "video/quicktime"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only MP4, WebM, and MOV video files are allowed"));
    }
  },
});

// Utility function to delete a file from Cloudinary
export const deleteFromCloudinary = async (
  publicId: string,
  resourceType: "image" | "video" | "raw" = "raw"
): Promise<{ success: boolean; result?: any; error?: string }> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return { success: result.result === "ok", result };
  } catch (error: any) {
    console.error("Cloudinary delete error:", error);
    return { success: false, error: error.message };
  }
};

// Generate a secure URL for private files
export const getSecureUrl = (
  publicId: string,
  resourceType: "image" | "video" | "raw" = "raw",
  expiresInSeconds: number = 3600
): string => {
  const timestamp = Math.round(Date.now() / 1000) + expiresInSeconds;

  return cloudinary.url(publicId, {
    resource_type: resourceType,
    type: "authenticated",
    sign_url: true,
    expires_at: timestamp,
  });
};

// Upload buffer directly (useful for processed files)
export const uploadBuffer = async (
  buffer: Buffer,
  options: {
    folder: string;
    publicId: string;
    resourceType?: "image" | "video" | "raw";
  }
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        public_id: options.publicId,
        resource_type: options.resourceType || "raw",
      },
      (
        error: UploadApiErrorResponse | undefined,
        result: UploadApiResponse | undefined
      ) => {
        if (error) reject(error);
        else if (result) resolve(result);
        else reject(new Error("Upload failed with no result"));
      }
    );
    uploadStream.end(buffer);
  });
};

export { cloudinary };
export default cloudinary;
