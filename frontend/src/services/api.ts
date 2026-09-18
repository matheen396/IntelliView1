import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("accessToken");
      // Optionally redirect to login
    }
    return Promise.reject(error);
  }
);

// Types
export interface Resume {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  skillsExtracted: string[];
  isIndexed: boolean;
  createdAt: string;
}

export interface UploadResumeResponse {
  success: boolean;
  message: string;
  data: {
    resume: Resume;
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
  };
}

export interface GeneratedQuestion {
  id: string;
  question: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  category: "TECHNICAL" | "BEHAVIORAL" | "SYSTEM_DESIGN" | "CODING" | "HR";
  expectedKeywords: string[];
  context: string;
  estimatedTime: number;
}

export interface GenerateQuestionsResponse {
  success: boolean;
  message: string;
  data: {
    questions: GeneratedQuestion[];
    metadata: {
      resumeId: string;
      jobRole: string;
      company?: string;
      generatedAt: string;
      totalQuestions: number;
    };
  };
}

// Resume API
export const resumeApi = {
  // Upload a resume
  upload: async (file: File): Promise<UploadResumeResponse> => {
    const formData = new FormData();
    formData.append("resume", file);

    const response = await api.post<UploadResumeResponse>(
      "/resumes/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  // Get all resumes for the current user
  getAll: async (): Promise<{ success: boolean; data: Resume[] }> => {
    const response = await api.get("/resumes");
    return response.data;
  },

  // Get a specific resume
  getById: async (id: string): Promise<{ success: boolean; data: Resume }> => {
    const response = await api.get(`/resumes/${id}`);
    return response.data;
  },

  // Delete a resume
  delete: async (
    id: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/resumes/${id}`);
    return response.data;
  },

  // Get download URL
  getDownloadUrl: async (
    id: string
  ): Promise<{ success: boolean; data: { downloadUrl: string } }> => {
    const response = await api.get(`/resumes/${id}/download`);
    return response.data;
  },
};

// Interview API
export const interviewApi = {
  // Get available job roles
  getJobRoles: async (): Promise<{ success: boolean; data: string[] }> => {
    const response = await api.get("/interview/job-roles");
    return response.data;
  },

  // Get available companies
  getCompanies: async (): Promise<{ success: boolean; data: string[] }> => {
    const response = await api.get("/interview/companies");
    return response.data;
  },

  // Generate interview questions
  generateQuestions: async (params: {
    resumeId: string;
    jobRole: string;
    company?: string;
    numberOfQuestions?: number;
  }): Promise<GenerateQuestionsResponse> => {
    const response = await api.post<GenerateQuestionsResponse>(
      "/interview/generate-questions",
      params
    );
    return response.data;
  },

  // Seed questions (admin only)
  seedQuestions: async (): Promise<{
    success: boolean;
    message: string;
    data: { questionsIndexed: number };
  }> => {
    const response = await api.post("/interview/seed-questions");
    return response.data;
  },
};

export default api;
