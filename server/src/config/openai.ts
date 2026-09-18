import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Model constants
export const MODELS = {
  EMBEDDING: "text-embedding-3-small",
  CHAT: "gpt-4o-mini", // Cost-effective for production
  CHAT_ADVANCED: "gpt-4o", // For more complex tasks
} as const;

// Generate embeddings for text
export const generateEmbedding = async (text: string): Promise<number[]> => {
  const response = await openai.embeddings.create({
    model: MODELS.EMBEDDING,
    input: text,
  });
  return response.data[0].embedding;
};

// Generate embeddings for multiple texts (batch)
export const generateEmbeddings = async (
  texts: string[]
): Promise<number[][]> => {
  const response = await openai.embeddings.create({
    model: MODELS.EMBEDDING,
    input: texts,
  });
  return response.data.map((d) => d.embedding);
};

export { openai };
export default openai;
