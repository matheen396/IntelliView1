import { Pinecone } from "@pinecone-database/pinecone";

// Initialize Pinecone client
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

// Index names
export const RESUME_INDEX = "intelliview-resumes";
export const COMPANY_QUESTIONS_INDEX = "intelliview-company-questions";

// Get or create index helper
export const getIndex = (indexName: string) => {
  return pinecone.index(indexName);
};

// Namespace constants for organizing vectors
export const NAMESPACES = {
  RESUMES: "resumes",
  COMPANY_QUESTIONS: "company-questions",
} as const;

// Dimension for OpenAI embeddings (text-embedding-3-small)
export const EMBEDDING_DIMENSION = 1536;

export { pinecone };
export default pinecone;
