import { openai, MODELS } from "../config/openai";
import { searchSimilarQuestions, CompanyQuestion } from "./vector.service";
import prisma from "../config/database";

// Types for generated questions
export interface GeneratedQuestion {
  id: string;
  question: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  category: "TECHNICAL" | "BEHAVIORAL" | "SYSTEM_DESIGN" | "CODING" | "HR";
  expectedKeywords: string[];
  context: string; // Why this question is relevant
  estimatedTime: number; // In minutes
}

export interface QuestionGenerationRequest {
  resumeId: string;
  jobRole: string;
  company?: string;
  numberOfQuestions?: number;
  difficultyMix?: {
    easy: number;
    medium: number;
    hard: number;
  };
}

export interface QuestionGenerationResponse {
  questions: GeneratedQuestion[];
  metadata: {
    resumeId: string;
    jobRole: string;
    company?: string;
    generatedAt: string;
    totalQuestions: number;
  };
}

// System prompt for structured question generation
const QUESTION_GENERATION_SYSTEM_PROMPT = `You are an expert technical interviewer with deep knowledge across software engineering, system design, and behavioral assessment. Your task is to generate highly personalized interview questions based on a candidate's resume and the target job role.

IMPORTANT RULES:
1. Generate questions that are directly relevant to the candidate's experience and skills
2. Mix technical depth with practical application
3. Include questions that probe both strengths and potential growth areas
4. Each question must be unique and non-repetitive
5. Questions should be progressively challenging
6. Include follow-up context for each question

OUTPUT FORMAT (JSON):
You MUST respond with valid JSON only. No markdown, no explanations outside JSON.
{
  "questions": [
    {
      "id": "q1",
      "question": "Full question text here",
      "difficulty": "EASY|MEDIUM|HARD",
      "category": "TECHNICAL|BEHAVIORAL|SYSTEM_DESIGN|CODING|HR",
      "expectedKeywords": ["keyword1", "keyword2", "keyword3"],
      "context": "Why this question is relevant to the candidate",
      "estimatedTime": 3
    }
  ]
}

CATEGORIES EXPLAINED:
- TECHNICAL: Language-specific, framework, or tool-related questions
- BEHAVIORAL: STAR method questions about past experiences
- SYSTEM_DESIGN: Architecture, scalability, and design patterns
- CODING: Algorithm, data structure, or problem-solving
- HR: Culture fit, motivation, and career goals

DIFFICULTY LEVELS:
- EASY: Fundamental concepts, basic syntax, simple scenarios
- MEDIUM: Application of concepts, trade-off discussions, moderate complexity
- HARD: Edge cases, optimization, complex system interactions`;

/**
 * Generate interview questions based on resume and job role
 */
export const generateInterviewQuestions = async (
  request: QuestionGenerationRequest
): Promise<QuestionGenerationResponse> => {
  const { resumeId, jobRole, company, numberOfQuestions = 10 } = request;
  const difficultyMix = request.difficultyMix || {
    easy: 2,
    medium: 5,
    hard: 3,
  };

  // 1. Fetch resume data from database
  const resume = await prisma.resume.findUnique({
    where: { id: resumeId },
    select: {
      rawText: true,
      skillsExtracted: true,
      parsedData: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!resume) {
    throw new Error("Resume not found");
  }

  // 2. Search for similar questions from the vector database
  const searchQuery = `${jobRole} ${
    resume.skillsExtracted?.join(" ") || ""
  } interview questions`;
  const similarQuestions = await searchSimilarQuestions(searchQuery, {
    company,
    role: jobRole,
    limit: 15,
    minScore: 0.5,
  }).catch(() => [] as Array<CompanyQuestion & { score: number }>);

  // 3. Build the prompt with all context
  const resumeContext = buildResumeContext(resume);
  const questionBankContext = buildQuestionBankContext(similarQuestions);

  const userPrompt = `
CANDIDATE PROFILE:
${resumeContext}

TARGET POSITION:
- Job Role: ${jobRole}
${company ? `- Company: ${company}` : ""}

REFERENCE QUESTIONS FROM COMPANY QUESTION BANK:
${questionBankContext}

REQUIREMENTS:
- Generate exactly ${numberOfQuestions} unique interview questions
- Difficulty distribution: ${difficultyMix.easy} EASY, ${
    difficultyMix.medium
  } MEDIUM, ${difficultyMix.hard} HARD
- Questions should be tailored to the candidate's specific experience
- Include a mix of categories (at least 3 different categories)
- Reference the candidate's actual projects, skills, or experiences when possible
- If company reference questions are provided, use them as inspiration but DO NOT copy them directly

Generate the questions now:`;

  // 4. Call OpenAI API
  const completion = await openai.chat.completions.create({
    model: MODELS.CHAT,
    messages: [
      { role: "system", content: QUESTION_GENERATION_SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.8, // Some creativity for varied questions
    max_tokens: 4000,
    response_format: { type: "json_object" },
  });

  const responseContent = completion.choices[0]?.message?.content;

  if (!responseContent) {
    throw new Error("Failed to generate questions: Empty response from AI");
  }

  // 5. Parse and validate the response
  let parsedResponse: { questions: GeneratedQuestion[] };
  try {
    parsedResponse = JSON.parse(responseContent);
  } catch (error) {
    console.error("Failed to parse AI response:", responseContent);
    throw new Error("Failed to parse AI response as JSON");
  }

  if (!parsedResponse.questions || !Array.isArray(parsedResponse.questions)) {
    throw new Error("Invalid response format: missing questions array");
  }

  // 6. Validate and normalize questions
  const validatedQuestions = parsedResponse.questions
    .slice(0, numberOfQuestions)
    .map((q, index) => ({
      id: q.id || `q${index + 1}`,
      question: q.question,
      difficulty: validateDifficulty(q.difficulty),
      category: validateCategory(q.category),
      expectedKeywords: Array.isArray(q.expectedKeywords)
        ? q.expectedKeywords
        : [],
      context: q.context || "",
      estimatedTime: typeof q.estimatedTime === "number" ? q.estimatedTime : 3,
    }));

  return {
    questions: validatedQuestions,
    metadata: {
      resumeId,
      jobRole,
      company,
      generatedAt: new Date().toISOString(),
      totalQuestions: validatedQuestions.length,
    },
  };
};

/**
 * Build resume context string for the prompt
 */
const buildResumeContext = (resume: {
  rawText: string | null;
  skillsExtracted: string[];
  parsedData: any;
  user: { name: string | null; email: string } | null;
}): string => {
  const parts: string[] = [];

  if (resume.user?.name) {
    parts.push(`Name: ${resume.user.name}`);
  }

  if (resume.skillsExtracted && resume.skillsExtracted.length > 0) {
    parts.push(`Technical Skills: ${resume.skillsExtracted.join(", ")}`);
  }

  if (resume.parsedData) {
    const parsed = resume.parsedData as any;
    if (parsed.extractedSections) {
      if (parsed.extractedSections.summary) {
        parts.push(`Summary: ${parsed.extractedSections.summary}`);
      }
      if (parsed.extractedSections.experience?.length > 0) {
        parts.push(
          `Experience Highlights:\n${parsed.extractedSections.experience
            .slice(0, 10)
            .join("\n")}`
        );
      }
      if (parsed.extractedSections.projects?.length > 0) {
        parts.push(
          `Projects:\n${parsed.extractedSections.projects
            .slice(0, 5)
            .join("\n")}`
        );
      }
      if (parsed.extractedSections.education?.length > 0) {
        parts.push(
          `Education:\n${parsed.extractedSections.education
            .slice(0, 3)
            .join("\n")}`
        );
      }
    }
  }

  // Fallback to raw text if parsed data is insufficient
  if (parts.length < 3 && resume.rawText) {
    parts.push(`Resume Content:\n${resume.rawText.slice(0, 3000)}`);
  }

  return parts.join("\n\n");
};

/**
 * Build question bank context for the prompt
 */
const buildQuestionBankContext = (
  questions: Array<CompanyQuestion & { score: number }>
): string => {
  if (!questions || questions.length === 0) {
    return "No reference questions available for this role/company.";
  }

  return questions
    .slice(0, 10)
    .map((q, i) => `${i + 1}. [${q.category}/${q.difficulty}] ${q.question}`)
    .join("\n");
};

/**
 * Validate difficulty value
 */
const validateDifficulty = (value: string): "EASY" | "MEDIUM" | "HARD" => {
  const normalized = value?.toUpperCase();
  if (["EASY", "MEDIUM", "HARD"].includes(normalized)) {
    return normalized as "EASY" | "MEDIUM" | "HARD";
  }
  return "MEDIUM";
};

/**
 * Validate category value
 */
const validateCategory = (
  value: string
): "TECHNICAL" | "BEHAVIORAL" | "SYSTEM_DESIGN" | "CODING" | "HR" => {
  const normalized = value?.toUpperCase();
  if (
    ["TECHNICAL", "BEHAVIORAL", "SYSTEM_DESIGN", "CODING", "HR"].includes(
      normalized
    )
  ) {
    return normalized as
      | "TECHNICAL"
      | "BEHAVIORAL"
      | "SYSTEM_DESIGN"
      | "CODING"
      | "HR";
  }
  return "TECHNICAL";
};

export default {
  generateInterviewQuestions,
};
