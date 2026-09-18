import React, { useState, useEffect } from "react";
import { interviewApi } from "../services/api";
import type { Resume, GeneratedQuestion } from "../services/api";

interface InterviewQuestionsProps {
  resumes: Resume[];
  onQuestionsGenerated?: (questions: GeneratedQuestion[]) => void;
}

const InterviewQuestions: React.FC<InterviewQuestionsProps> = ({
  resumes,
  onQuestionsGenerated,
}) => {
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [selectedJobRole, setSelectedJobRole] = useState<string>("");
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [numberOfQuestions, setNumberOfQuestions] = useState<number>(10);
  const [jobRoles, setJobRoles] = useState<string[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<
    GeneratedQuestion[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  // Fetch job roles and companies on mount
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [rolesResponse, companiesResponse] = await Promise.all([
          interviewApi.getJobRoles(),
          interviewApi.getCompanies(),
        ]);

        if (rolesResponse.success) {
          setJobRoles(rolesResponse.data);
        }
        if (companiesResponse.success) {
          setCompanies(companiesResponse.data);
        }
      } catch (error) {
        console.error("Failed to fetch options:", error);
      }
    };

    fetchOptions();
  }, []);

  // Auto-select first resume if available
  useEffect(() => {
    if (resumes.length > 0 && !selectedResumeId) {
      setSelectedResumeId(resumes[0].id);
    }
  }, [resumes, selectedResumeId]);

  const handleGenerateQuestions = async () => {
    if (!selectedResumeId || !selectedJobRole) {
      setError("Please select a resume and job role");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedQuestions([]);

    try {
      const response = await interviewApi.generateQuestions({
        resumeId: selectedResumeId,
        jobRole: selectedJobRole,
        company: selectedCompany || undefined,
        numberOfQuestions,
      });

      if (response.success) {
        setGeneratedQuestions(response.data.questions);
        onQuestionsGenerated?.(response.data.questions);
      } else {
        throw new Error("Failed to generate questions");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to generate questions";
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "EASY":
        return "bg-emerald-100 text-emerald-700";
      case "MEDIUM":
        return "bg-amber-100 text-amber-700";
      case "HARD":
        return "bg-rose-100 text-rose-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "TECHNICAL":
        return "bg-blue-100 text-blue-700";
      case "BEHAVIORAL":
        return "bg-purple-100 text-purple-700";
      case "SYSTEM_DESIGN":
        return "bg-indigo-100 text-indigo-700";
      case "CODING":
        return "bg-cyan-100 text-cyan-700";
      case "HR":
        return "bg-pink-100 text-pink-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "TECHNICAL":
        return "⚙️";
      case "BEHAVIORAL":
        return "💬";
      case "SYSTEM_DESIGN":
        return "🏗️";
      case "CODING":
        return "💻";
      case "HR":
        return "👥";
      default:
        return "📝";
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration Panel */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <svg
              className="h-5 w-5 text-indigo-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            Generate Interview Questions
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Select your resume and target role to generate personalized
            questions
          </p>
        </div>

        <div className="p-6 space-y-4">
          {/* Resume Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Select Resume
            </label>
            <select
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              disabled={resumes.length === 0}
            >
              {resumes.length === 0 ? (
                <option value="">No resumes uploaded</option>
              ) : (
                <>
                  <option value="">Select a resume...</option>
                  {resumes.map((resume) => (
                    <option key={resume.id} value={resume.id}>
                      {resume.fileName} ({resume.skillsExtracted.length} skills)
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          {/* Job Role Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Target Job Role
            </label>
            <select
              value={selectedJobRole}
              onChange={(e) => setSelectedJobRole(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select a job role...</option>
              {jobRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          {/* Company Selection (Optional) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Target Company <span className="text-slate-400">(Optional)</span>
            </label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Any company</option>
              {companies.map((company) => (
                <option key={company} value={company}>
                  {company}
                </option>
              ))}
            </select>
          </div>

          {/* Number of Questions */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Number of Questions
            </label>
            <select
              value={numberOfQuestions}
              onChange={(e) => setNumberOfQuestions(Number(e.target.value))}
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value={5}>5 Questions</option>
              <option value={10}>10 Questions</option>
              <option value={15}>15 Questions</option>
              <option value={20}>20 Questions</option>
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg">
              <p className="text-sm text-rose-700">{error}</p>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerateQuestions}
            disabled={isGenerating || !selectedResumeId || !selectedJobRole}
            className={`w-full px-4 py-3 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
              isGenerating || !selectedResumeId || !selectedJobRole
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
            }`}
          >
            {isGenerating ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
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
                Generating Questions...
              </>
            ) : (
              <>
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
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Generate Questions
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Questions */}
      {generatedQuestions.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Generated Questions
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {generatedQuestions.length} personalized questions for{" "}
                  {selectedJobRole}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 text-xs font-medium rounded-full ${getDifficultyColor(
                    "EASY"
                  )}`}
                >
                  {
                    generatedQuestions.filter((q) => q.difficulty === "EASY")
                      .length
                  }{" "}
                  Easy
                </span>
                <span
                  className={`px-2.5 py-1 text-xs font-medium rounded-full ${getDifficultyColor(
                    "MEDIUM"
                  )}`}
                >
                  {
                    generatedQuestions.filter((q) => q.difficulty === "MEDIUM")
                      .length
                  }{" "}
                  Medium
                </span>
                <span
                  className={`px-2.5 py-1 text-xs font-medium rounded-full ${getDifficultyColor(
                    "HARD"
                  )}`}
                >
                  {
                    generatedQuestions.filter((q) => q.difficulty === "HARD")
                      .length
                  }{" "}
                  Hard
                </span>
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {generatedQuestions.map((question, index) => (
              <div
                key={question.id}
                className="p-6 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-semibold text-indigo-600">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${getDifficultyColor(
                          question.difficulty
                        )}`}
                      >
                        {question.difficulty}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${getCategoryColor(
                          question.category
                        )}`}
                      >
                        {getCategoryIcon(question.category)}{" "}
                        {question.category.replace("_", " ")}
                      </span>
                      <span className="text-xs text-slate-400">
                        ~{question.estimatedTime} min
                      </span>
                    </div>

                    <p className="text-sm text-slate-900 leading-relaxed">
                      {question.question}
                    </p>

                    {/* Expandable Details */}
                    <button
                      onClick={() =>
                        setExpandedQuestion(
                          expandedQuestion === question.id ? null : question.id
                        )
                      }
                      className="mt-3 text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                    >
                      {expandedQuestion === question.id ? (
                        <>
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
                              d="M5 15l7-7 7 7"
                            />
                          </svg>
                          Hide Details
                        </>
                      ) : (
                        <>
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
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                          Show Details
                        </>
                      )}
                    </button>

                    {expandedQuestion === question.id && (
                      <div className="mt-3 p-4 bg-slate-50 rounded-lg space-y-3">
                        {question.context && (
                          <div>
                            <p className="text-xs font-medium text-slate-500 mb-1">
                              Why this question:
                            </p>
                            <p className="text-sm text-slate-700">
                              {question.context}
                            </p>
                          </div>
                        )}
                        {question.expectedKeywords.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-slate-500 mb-1">
                              Expected Keywords:
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {question.expectedKeywords.map((keyword, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 text-xs bg-white border border-slate-200 text-slate-600 rounded"
                                >
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {generatedQuestions.length === 0 && !isGenerating && (
        <div className="text-center py-12">
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
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-slate-900 mb-1">
            No questions generated yet
          </h3>
          <p className="text-sm text-slate-500">
            Select your resume and job role, then click generate
          </p>
        </div>
      )}
    </div>
  );
};

export default InterviewQuestions;
