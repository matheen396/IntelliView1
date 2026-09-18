import React, { useState, useCallback } from "react";
import { resumeApi } from "../services/api";
import type { Resume, UploadResumeResponse } from "../services/api";

interface ResumeUploadProps {
  onUploadSuccess?: (resume: Resume) => void;
  onUploadError?: (error: string) => void;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({
  onUploadSuccess,
  onUploadError,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    stage: "uploading" | "parsing" | "indexing" | "complete" | "error";
    message: string;
  } | null>(null);
  const [uploadResult, setUploadResult] = useState<
    UploadResumeResponse["data"] | null
  >(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileUpload(files[0]);
      }
    },
    []
  );

  const handleFileUpload = async (file: File) => {
    // Validate file type
    if (file.type !== "application/pdf") {
      setUploadProgress({
        stage: "error",
        message: "Only PDF files are allowed",
      });
      onUploadError?.("Only PDF files are allowed");
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setUploadProgress({
        stage: "error",
        message: "File size must be less than 10MB",
      });
      onUploadError?.("File size must be less than 10MB");
      return;
    }

    setIsUploading(true);
    setUploadProgress({
      stage: "uploading",
      message: "Uploading resume to cloud...",
    });
    setUploadResult(null);

    try {
      setUploadProgress({
        stage: "parsing",
        message: "Parsing resume content...",
      });

      const response = await resumeApi.upload(file);

      if (response.success) {
        setUploadProgress({
          stage: "complete",
          message: "Resume processed successfully!",
        });
        setUploadResult(response.data);
        onUploadSuccess?.(response.data.resume);
      } else {
        throw new Error("Upload failed");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to upload resume";
      setUploadProgress({ stage: "error", message: errorMessage });
      onUploadError?.(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const resetUpload = () => {
    setUploadProgress(null);
    setUploadResult(null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="w-full">
      {/* Upload Area */}
      {!uploadResult && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            isDragging
              ? "border-indigo-500 bg-indigo-50"
              : "border-slate-300 hover:border-indigo-400 hover:bg-slate-50"
          } ${
            isUploading ? "pointer-events-none opacity-70" : "cursor-pointer"
          }`}
        >
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />

          <div className="flex flex-col items-center gap-4">
            {isUploading ? (
              <>
                <div className="h-14 w-14 rounded-full bg-indigo-100 flex items-center justify-center">
                  <svg
                    className="h-7 w-7 text-indigo-600 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {uploadProgress?.message}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Please wait...</p>
                </div>
              </>
            ) : (
              <>
                <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center">
                  <svg
                    className="h-7 w-7 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    <span className="text-indigo-600">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    PDF files only (max 10MB)
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Error State */}
      {uploadProgress?.stage === "error" && !uploadResult && (
        <div className="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="h-5 w-5 text-rose-500 shrink-0 mt-0.5">
              <svg
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-rose-800">
                {uploadProgress.message}
              </p>
              <button
                onClick={resetUpload}
                className="mt-2 text-sm text-rose-600 hover:text-rose-700 font-medium"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success State */}
      {uploadResult && (
        <div className="mt-4 p-6 bg-white border border-slate-200 rounded-xl">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
              <svg
                className="h-6 w-6 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-slate-900 truncate">
                {uploadResult.resume.fileName}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {formatFileSize(uploadResult.resume.fileSize)} • Uploaded
                successfully
              </p>

              {/* Processing Results */}
              <div className="mt-4 space-y-3">
                {/* Parsing Status */}
                <div className="flex items-center gap-2">
                  {uploadResult.parsing.success ? (
                    <span className="h-5 w-5 text-emerald-500">
                      <svg
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </span>
                  ) : (
                    <span className="h-5 w-5 text-amber-500">
                      <svg
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v2m0 4h.01"
                        />
                      </svg>
                    </span>
                  )}
                  <span className="text-sm text-slate-600">
                    Parsed {uploadResult.parsing.skillsFound} skills from{" "}
                    {uploadResult.parsing.sectionsExtracted.length} sections
                  </span>
                </div>

                {/* Indexing Status */}
                <div className="flex items-center gap-2">
                  {uploadResult.indexing.success ? (
                    <span className="h-5 w-5 text-emerald-500">
                      <svg
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </span>
                  ) : (
                    <span className="h-5 w-5 text-amber-500">
                      <svg
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v2m0 4h.01"
                        />
                      </svg>
                    </span>
                  )}
                  <span className="text-sm text-slate-600">
                    {uploadResult.indexing.success
                      ? "Indexed for AI question generation"
                      : "Indexing pending"}
                  </span>
                </div>

                {/* Skills Extracted */}
                {uploadResult.resume.skillsExtracted.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-slate-500 mb-2">
                      Skills Detected:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {uploadResult.resume.skillsExtracted
                        .slice(0, 10)
                        .map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-0.5 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      {uploadResult.resume.skillsExtracted.length > 10 && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">
                          +{uploadResult.resume.skillsExtracted.length - 10}{" "}
                          more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex gap-3">
            <button
              onClick={resetUpload}
              className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Upload Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;
