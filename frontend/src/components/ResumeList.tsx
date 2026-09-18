import React, { useState } from "react";
import { resumeApi } from "../services/api";
import type { Resume } from "../services/api";

interface ResumeListProps {
  resumes: Resume[];
  onResumeDeleted?: (resumeId: string) => void;
  onResumeSelect?: (resume: Resume) => void;
  selectedResumeId?: string;
}

const ResumeList: React.FC<ResumeListProps> = ({
  resumes,
  onResumeDeleted,
  onResumeSelect,
  selectedResumeId,
}) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleDelete = async (resumeId: string) => {
    if (!confirm("Are you sure you want to delete this resume?")) {
      return;
    }

    setDeletingId(resumeId);
    try {
      const response = await resumeApi.delete(resumeId);
      if (response.success) {
        onResumeDeleted?.(resumeId);
      }
    } catch (error) {
      console.error("Failed to delete resume:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = async (resume: Resume) => {
    setDownloadingId(resume.id);
    try {
      const response = await resumeApi.getDownloadUrl(resume.id);
      if (response.success && response.data.downloadUrl) {
        window.open(response.data.downloadUrl, "_blank");
      }
    } catch (error) {
      console.error("Failed to get download URL:", error);
      // Fallback to direct URL
      window.open(resume.fileUrl, "_blank");
    } finally {
      setDownloadingId(null);
    }
  };

  if (resumes.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
        <div className="h-14 w-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-sm font-medium text-slate-900 mb-1">
          No resumes uploaded
        </h3>
        <p className="text-sm text-slate-500">
          Upload your first resume to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {resumes.map((resume) => (
        <div
          key={resume.id}
          onClick={() => onResumeSelect?.(resume)}
          className={`p-4 bg-white border rounded-xl transition-all cursor-pointer ${
            selectedResumeId === resume.id
              ? "border-indigo-500 ring-2 ring-indigo-100"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-start gap-4">
            {/* File Icon */}
            <div className="h-12 w-12 rounded-lg bg-rose-50 flex items-center justify-center shrink-0">
              <svg
                className="h-6 w-6 text-rose-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-slate-900 truncate">
                  {resume.fileName}
                </h3>
                {resume.isIndexed && (
                  <span className="px-1.5 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 rounded">
                    AI Ready
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 mt-1">
                {formatFileSize(resume.fileSize)} • Uploaded{" "}
                {formatDate(resume.createdAt)}
              </p>

              {/* Skills Preview */}
              {resume.skillsExtracted.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {resume.skillsExtracted.slice(0, 5).map((skill, index) => (
                    <span
                      key={index}
                      className="px-1.5 py-0.5 text-xs bg-slate-100 text-slate-600 rounded"
                    >
                      {skill}
                    </span>
                  ))}
                  {resume.skillsExtracted.length > 5 && (
                    <span className="px-1.5 py-0.5 text-xs bg-slate-100 text-slate-500 rounded">
                      +{resume.skillsExtracted.length - 5}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div
              className="flex items-center gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => handleDownload(resume)}
                disabled={downloadingId === resume.id}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                title="Download"
              >
                {downloadingId === resume.id ? (
                  <svg
                    className="h-4 w-4 animate-spin"
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
                ) : (
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                )}
              </button>

              <button
                onClick={() => handleDelete(resume.id)}
                disabled={deletingId === resume.id}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Delete"
              >
                {deletingId === resume.id ? (
                  <svg
                    className="h-4 w-4 animate-spin"
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
                ) : (
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ResumeList;
