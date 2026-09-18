import { v4 as uuidv4 } from "uuid";
import {
  getIndex,
  COMPANY_QUESTIONS_INDEX,
  NAMESPACES,
} from "../config/pinecone";
import { generateEmbedding, generateEmbeddings } from "../config/openai";

// Types for company questions
export interface CompanyQuestion {
  id: string;
  company: string;
  role: string;
  question: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  category: "TECHNICAL" | "BEHAVIORAL" | "SYSTEM_DESIGN" | "CODING" | "HR";
  expectedKeywords: string[];
  metadata?: Record<string, any>;
}

export interface VectorMetadata {
  [key: string]: string;
  id: string;
  company: string;
  role: string;
  question: string;
  difficulty: string;
  category: string;
  expectedKeywords: string;
  type: "company_question" | "resume";
}

export interface ResumeVectorMetadata {
  [key: string]: string;
  id: string;
  resumeId: string;
  userId: string;
  skills: string;
  summary: string;
  type: "resume";
}

/**
 * Index a company question into the vector database
 */
export const indexCompanyQuestion = async (
  question: CompanyQuestion
): Promise<string> => {
  const index = getIndex(COMPANY_QUESTIONS_INDEX);

  // Create text for embedding
  const embeddingText = `Company: ${question.company}. Role: ${question.role}. Question: ${question.question}. Category: ${question.category}. Difficulty: ${question.difficulty}`;

  const embedding = await generateEmbedding(embeddingText);
  const vectorId = question.id || uuidv4();

  await index.namespace(NAMESPACES.COMPANY_QUESTIONS).upsert([
    {
      id: vectorId,
      values: embedding,
      metadata: {
        id: vectorId,
        company: question.company,
        role: question.role,
        question: question.question,
        difficulty: question.difficulty,
        category: question.category,
        expectedKeywords: question.expectedKeywords.join(","),
        type: "company_question",
      } as VectorMetadata,
    },
  ]);

  return vectorId;
};

/**
 * Batch index company questions
 */
export const indexCompanyQuestions = async (
  questions: CompanyQuestion[]
): Promise<string[]> => {
  const index = getIndex(COMPANY_QUESTIONS_INDEX);

  // Create embedding texts
  const embeddingTexts = questions.map(
    (q) =>
      `Company: ${q.company}. Role: ${q.role}. Question: ${q.question}. Category: ${q.category}. Difficulty: ${q.difficulty}`
  );

  const embeddings = await generateEmbeddings(embeddingTexts);
  const vectorIds: string[] = [];

  const vectors = questions.map((question, i) => {
    const vectorId = question.id || uuidv4();
    vectorIds.push(vectorId);

    return {
      id: vectorId,
      values: embeddings[i],
      metadata: {
        id: vectorId,
        company: question.company,
        role: question.role,
        question: question.question,
        difficulty: question.difficulty,
        category: question.category,
        expectedKeywords: question.expectedKeywords.join(","),
        type: "company_question",
      } as VectorMetadata,
    };
  });

  // Batch upsert (Pinecone supports up to 100 vectors per batch)
  const batchSize = 100;
  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize);
    await index.namespace(NAMESPACES.COMPANY_QUESTIONS).upsert(batch);
  }

  return vectorIds;
};

/**
 * Search for similar questions based on role and context
 */
export const searchSimilarQuestions = async (
  query: string,
  options: {
    company?: string;
    role?: string;
    limit?: number;
    minScore?: number;
  } = {}
): Promise<Array<CompanyQuestion & { score: number }>> => {
  const index = getIndex(COMPANY_QUESTIONS_INDEX);
  const { limit = 10, minScore = 0.7 } = options;

  const queryEmbedding = await generateEmbedding(query);

  // Build filter
  const filter: Record<string, any> = { type: { $eq: "company_question" } };
  if (options.company) {
    filter.company = { $eq: options.company };
  }
  if (options.role) {
    filter.role = { $eq: options.role };
  }

  const results = await index.namespace(NAMESPACES.COMPANY_QUESTIONS).query({
    vector: queryEmbedding,
    topK: limit,
    includeMetadata: true,
    filter,
  });

  return results.matches
    .filter((match) => (match.score || 0) >= minScore)
    .map((match) => ({
      id: match.metadata?.id as string,
      company: match.metadata?.company as string,
      role: match.metadata?.role as string,
      question: match.metadata?.question as string,
      difficulty: match.metadata?.difficulty as "EASY" | "MEDIUM" | "HARD",
      category: match.metadata?.category as
        | "TECHNICAL"
        | "BEHAVIORAL"
        | "SYSTEM_DESIGN"
        | "CODING"
        | "HR",
      expectedKeywords:
        (match.metadata?.expectedKeywords as string)?.split(",") || [],
      score: match.score || 0,
    }));
};

/**
 * Index a resume into the vector database
 */
export const indexResume = async (
  resumeId: string,
  userId: string,
  embeddingText: string,
  skills: string[],
  summary: string
): Promise<string> => {
  const index = getIndex(COMPANY_QUESTIONS_INDEX);

  const embedding = await generateEmbedding(embeddingText);
  const vectorId = `resume_${resumeId}`;

  await index.namespace(NAMESPACES.RESUMES).upsert([
    {
      id: vectorId,
      values: embedding,
      metadata: {
        id: vectorId,
        resumeId,
        userId,
        skills: skills.join(","),
        summary: summary.slice(0, 1000), // Limit summary length
        type: "resume",
      } as ResumeVectorMetadata,
    },
  ]);

  return vectorId;
};

/**
 * Delete a resume from the vector database
 */
export const deleteResumeVector = async (resumeId: string): Promise<void> => {
  const index = getIndex(COMPANY_QUESTIONS_INDEX);
  const vectorId = `resume_${resumeId}`;

  await index.namespace(NAMESPACES.RESUMES).deleteOne(vectorId);
};

/**
 * Get resume context for question generation
 */
export const getResumeContext = async (
  resumeId: string
): Promise<{
  skills: string[];
  summary: string;
} | null> => {
  const index = getIndex(COMPANY_QUESTIONS_INDEX);
  const vectorId = `resume_${resumeId}`;

  try {
    const result = await index.namespace(NAMESPACES.RESUMES).fetch([vectorId]);
    const record = result.records[vectorId];

    if (!record?.metadata) {
      return null;
    }

    return {
      skills: (record.metadata.skills as string)?.split(",") || [],
      summary: (record.metadata.summary as string) || "",
    };
  } catch (error) {
    console.error("Error fetching resume context:", error);
    return null;
  }
};

export default {
  indexCompanyQuestion,
  indexCompanyQuestions,
  searchSimilarQuestions,
  indexResume,
  deleteResumeVector,
  getResumeContext,
};
