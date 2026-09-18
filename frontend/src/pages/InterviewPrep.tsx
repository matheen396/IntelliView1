import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { resumeApi } from "../services/api";
import type { Resume } from "../services/api";
import ResumeUpload from "../components/ResumeUpload";
import ResumeList from "../components/ResumeList";
import InterviewQuestions from "../components/InterviewQuestions";

type Tab = "resumes" | "questions";

const InterviewPrep: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("resumes");
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);

  // Fetch resumes on mount
  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const response = await resumeApi.getAll();
        if (response.success) {
          setResumes(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch resumes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResumes();
  }, []);

  const handleResumeUploadSuccess = (resume: Resume) => {
    setResumes((prev) => [resume, ...prev]);
  };

  const handleResumeDeleted = (resumeId: string) => {
    setResumes((prev) => prev.filter((r) => r.id !== resumeId));
    if (selectedResume?.id === resumeId) {
      setSelectedResume(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Development Notice */}
      <div className="bg-amber-400 text-amber-900 px-4 py-2 text-center text-sm font-medium">
        🔓 Development Mode — Authentication Bypassed
      </div>

      {/* Navigation Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo & Nav */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center">
                  <svg
                    className="h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <span className="text-xl font-semibold text-slate-900">
                  IntelliView
                </span>
              </div>

              <nav className="hidden md:flex items-center space-x-1">
                <a
                  href="/"
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Dashboard
                </a>
                <a
                  href="/interview-prep"
                  className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg"
                >
                  Interview Prep
                </a>
                <a
                  href="#"
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Analytics
                </a>
              </nav>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                {user?.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name || "User"}
                    className="h-9 w-9 rounded-full ring-2 ring-white"
                  />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium text-sm">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                )}
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-slate-900">
                    {user?.name}
                  </p>
                  <p className="text-xs text-slate-500">{user?.role}</p>
                </div>
              </div>

              <button
                onClick={logout}
                className="ml-2 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                title="Logout"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-screen-2xl mx-auto px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Interview Preparation
          </h1>
          <p className="mt-2 text-slate-500">
            Upload your resume and generate personalized interview questions
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-slate-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("resumes")}
              className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "resumes"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-2">
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                My Resumes
                {resumes.length > 0 && (
                  <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded-full">
                    {resumes.length}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => setActiveTab("questions")}
              className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "questions"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-2">
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
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Generate Questions
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "resumes" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <div>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-200">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Upload Resume
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Upload a PDF resume to analyze and generate questions
                  </p>
                </div>
                <div className="p-6">
                  <ResumeUpload
                    onUploadSuccess={handleResumeUploadSuccess}
                    onUploadError={(error) =>
                      console.error("Upload error:", error)
                    }
                  />
                </div>
              </div>

              {/* Info Cards */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="p-4 bg-indigo-50 rounded-xl">
                  <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-3">
                    <svg
                      className="h-5 w-5 text-indigo-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Smart Parsing
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    AI extracts skills, experience, and education automatically
                  </p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-xl">
                  <div className="h-10 w-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-3">
                    <svg
                      className="h-5 w-5 text-emerald-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Secure Storage
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Files stored securely in the cloud with encryption
                  </p>
                </div>
              </div>
            </div>

            {/* Resumes List */}
            <div>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-200">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Your Resumes
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {resumes.length === 0
                      ? "No resumes uploaded yet"
                      : `${resumes.length} resume${
                          resumes.length > 1 ? "s" : ""
                        } uploaded`}
                  </p>
                </div>
                <div className="p-6">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <svg
                        className="h-8 w-8 text-indigo-600 animate-spin"
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
                  ) : (
                    <ResumeList
                      resumes={resumes}
                      onResumeDeleted={handleResumeDeleted}
                      onResumeSelect={setSelectedResume}
                      selectedResumeId={selectedResume?.id}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "questions" && (
          <div className="max-w-4xl">
            {resumes.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
                <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="h-8 w-8 text-slate-400"
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
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  No resume uploaded
                </h3>
                <p className="text-slate-500 mb-6">
                  Upload a resume first to generate personalized interview
                  questions
                </p>
                <button
                  onClick={() => setActiveTab("resumes")}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Upload Resume
                </button>
              </div>
            ) : (
              <InterviewQuestions resumes={resumes} />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              © 2026 IntelliView. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a
                href="#"
                className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                Terms
              </a>
              <a
                href="#"
                className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default InterviewPrep;
