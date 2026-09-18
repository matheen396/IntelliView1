import { indexCompanyQuestions, CompanyQuestion } from "./vector.service";
import { v4 as uuidv4 } from "uuid";

// Dummy company questions for initial seeding
export const SEED_COMPANY_QUESTIONS: CompanyQuestion[] = [
  // Google Questions
  {
    id: uuidv4(),
    company: "Google",
    role: "Software Engineer",
    question:
      "Design a URL shortening service like bit.ly. How would you handle high traffic and ensure fast redirects?",
    difficulty: "HARD",
    category: "SYSTEM_DESIGN",
    expectedKeywords: [
      "hash function",
      "database",
      "caching",
      "load balancing",
      "base62 encoding",
      "collision handling",
    ],
  },
  {
    id: uuidv4(),
    company: "Google",
    role: "Software Engineer",
    question:
      "Given an array of integers, find two numbers that add up to a specific target. What is the most efficient approach?",
    difficulty: "EASY",
    category: "CODING",
    expectedKeywords: [
      "hash map",
      "two pointers",
      "O(n)",
      "complement",
      "dictionary",
    ],
  },
  {
    id: uuidv4(),
    company: "Google",
    role: "Software Engineer",
    question:
      "Describe a time when you had to make a difficult technical decision with incomplete information. How did you approach it?",
    difficulty: "MEDIUM",
    category: "BEHAVIORAL",
    expectedKeywords: [
      "decision making",
      "risk assessment",
      "stakeholder communication",
      "trade-offs",
      "iteration",
    ],
  },
  {
    id: uuidv4(),
    company: "Google",
    role: "Software Engineer",
    question:
      "Explain the difference between processes and threads. When would you use one over the other?",
    difficulty: "MEDIUM",
    category: "TECHNICAL",
    expectedKeywords: [
      "memory space",
      "context switching",
      "parallelism",
      "concurrency",
      "shared memory",
      "IPC",
    ],
  },

  // Amazon Questions
  {
    id: uuidv4(),
    company: "Amazon",
    role: "Software Development Engineer",
    question:
      "Design an e-commerce shopping cart system. How would you handle inventory management and concurrent purchases?",
    difficulty: "HARD",
    category: "SYSTEM_DESIGN",
    expectedKeywords: [
      "distributed systems",
      "eventual consistency",
      "locking",
      "microservices",
      "message queue",
      "idempotency",
    ],
  },
  {
    id: uuidv4(),
    company: "Amazon",
    role: "Software Development Engineer",
    question:
      "Tell me about a time when you had to deliver a project under tight deadlines. How did you prioritize?",
    difficulty: "MEDIUM",
    category: "BEHAVIORAL",
    expectedKeywords: [
      "prioritization",
      "deadline",
      "MVP",
      "communication",
      "leadership principle",
      "bias for action",
    ],
  },
  {
    id: uuidv4(),
    company: "Amazon",
    role: "Software Development Engineer",
    question:
      "Implement an LRU (Least Recently Used) cache with O(1) get and put operations.",
    difficulty: "MEDIUM",
    category: "CODING",
    expectedKeywords: [
      "doubly linked list",
      "hash map",
      "O(1)",
      "eviction policy",
      "data structure",
    ],
  },
  {
    id: uuidv4(),
    company: "Amazon",
    role: "Software Development Engineer",
    question:
      "Explain how you would optimize a slow database query. What tools and techniques would you use?",
    difficulty: "MEDIUM",
    category: "TECHNICAL",
    expectedKeywords: [
      "indexing",
      "query plan",
      "EXPLAIN",
      "normalization",
      "caching",
      "partitioning",
    ],
  },

  // Microsoft Questions
  {
    id: uuidv4(),
    company: "Microsoft",
    role: "Software Engineer",
    question:
      "Design a real-time collaborative document editing system like Google Docs.",
    difficulty: "HARD",
    category: "SYSTEM_DESIGN",
    expectedKeywords: [
      "CRDT",
      "operational transformation",
      "WebSocket",
      "conflict resolution",
      "version control",
      "eventual consistency",
    ],
  },
  {
    id: uuidv4(),
    company: "Microsoft",
    role: "Software Engineer",
    question:
      "How would you find the kth largest element in an unsorted array? Discuss multiple approaches.",
    difficulty: "MEDIUM",
    category: "CODING",
    expectedKeywords: [
      "quickselect",
      "heap",
      "partition",
      "O(n)",
      "pivot",
      "min-heap",
    ],
  },
  {
    id: uuidv4(),
    company: "Microsoft",
    role: "Software Engineer",
    question:
      "What is dependency injection and why is it useful? Can you give an example?",
    difficulty: "EASY",
    category: "TECHNICAL",
    expectedKeywords: [
      "IoC",
      "loose coupling",
      "testing",
      "SOLID principles",
      "interface",
      "mockability",
    ],
  },
  {
    id: uuidv4(),
    company: "Microsoft",
    role: "Software Engineer",
    question:
      "Describe a situation where you disagreed with a team member. How did you handle it?",
    difficulty: "EASY",
    category: "BEHAVIORAL",
    expectedKeywords: [
      "conflict resolution",
      "communication",
      "empathy",
      "collaboration",
      "compromise",
    ],
  },

  // Meta Questions
  {
    id: uuidv4(),
    company: "Meta",
    role: "Software Engineer",
    question:
      "Design a news feed system for a social media platform. How would you rank and personalize content?",
    difficulty: "HARD",
    category: "SYSTEM_DESIGN",
    expectedKeywords: [
      "ranking algorithm",
      "machine learning",
      "caching",
      "fan-out",
      "graph database",
      "real-time",
    ],
  },
  {
    id: uuidv4(),
    company: "Meta",
    role: "Software Engineer",
    question:
      "Given a binary tree, serialize and deserialize it. Explain your approach.",
    difficulty: "MEDIUM",
    category: "CODING",
    expectedKeywords: [
      "BFS",
      "DFS",
      "preorder",
      "null markers",
      "recursion",
      "queue",
    ],
  },
  {
    id: uuidv4(),
    company: "Meta",
    role: "Software Engineer",
    question:
      "Explain the React component lifecycle. What hooks would you use and when?",
    difficulty: "EASY",
    category: "TECHNICAL",
    expectedKeywords: [
      "useEffect",
      "useState",
      "mounting",
      "cleanup",
      "dependencies",
      "memoization",
    ],
  },
  {
    id: uuidv4(),
    company: "Meta",
    role: "Software Engineer",
    question:
      "Tell me about a project you are most proud of. What was your specific contribution?",
    difficulty: "EASY",
    category: "BEHAVIORAL",
    expectedKeywords: [
      "impact",
      "ownership",
      "technical challenges",
      "teamwork",
      "results",
    ],
  },

  // Apple Questions
  {
    id: uuidv4(),
    company: "Apple",
    role: "Software Engineer",
    question:
      "Design a music streaming service like Apple Music. Focus on the audio playback and offline mode.",
    difficulty: "HARD",
    category: "SYSTEM_DESIGN",
    expectedKeywords: [
      "CDN",
      "adaptive bitrate",
      "offline storage",
      "DRM",
      "queue management",
      "caching",
    ],
  },
  {
    id: uuidv4(),
    company: "Apple",
    role: "Software Engineer",
    question:
      "Implement a function to detect if a linked list has a cycle. Follow up: find the start of the cycle.",
    difficulty: "MEDIUM",
    category: "CODING",
    expectedKeywords: [
      "Floyd cycle detection",
      "two pointers",
      "slow fast",
      "O(1) space",
      "tortoise hare",
    ],
  },
  {
    id: uuidv4(),
    company: "Apple",
    role: "Software Engineer",
    question:
      "What are the key principles of good API design? Give examples of APIs you consider well-designed.",
    difficulty: "MEDIUM",
    category: "TECHNICAL",
    expectedKeywords: [
      "REST",
      "consistency",
      "versioning",
      "documentation",
      "error handling",
      "idempotency",
    ],
  },
  {
    id: uuidv4(),
    company: "Apple",
    role: "Software Engineer",
    question:
      "How do you stay current with new technologies? Give an example of something you learned recently.",
    difficulty: "EASY",
    category: "HR",
    expectedKeywords: [
      "learning",
      "curiosity",
      "continuous improvement",
      "side projects",
      "community",
    ],
  },

  // Netflix Questions
  {
    id: uuidv4(),
    company: "Netflix",
    role: "Software Engineer",
    question:
      "Design a video streaming platform. How would you handle adaptive bitrate streaming and global content delivery?",
    difficulty: "HARD",
    category: "SYSTEM_DESIGN",
    expectedKeywords: [
      "CDN",
      "transcoding",
      "HLS",
      "DASH",
      "edge servers",
      "buffering",
      "quality adaptation",
    ],
  },
  {
    id: uuidv4(),
    company: "Netflix",
    role: "Software Engineer",
    question:
      "Given a matrix of 0s and 1s, find the largest rectangle containing only 1s.",
    difficulty: "HARD",
    category: "CODING",
    expectedKeywords: [
      "histogram",
      "dynamic programming",
      "stack",
      "maximal rectangle",
      "O(mn)",
    ],
  },
  {
    id: uuidv4(),
    company: "Netflix",
    role: "Software Engineer",
    question:
      "Explain chaos engineering. How would you implement it in a production environment?",
    difficulty: "HARD",
    category: "TECHNICAL",
    expectedKeywords: [
      "fault injection",
      "resilience",
      "Chaos Monkey",
      "blast radius",
      "hypothesis",
      "steady state",
    ],
  },
  {
    id: uuidv4(),
    company: "Netflix",
    role: "Software Engineer",
    question:
      "Describe a time when you took a risk that failed. What did you learn from it?",
    difficulty: "MEDIUM",
    category: "BEHAVIORAL",
    expectedKeywords: [
      "failure",
      "learning",
      "risk assessment",
      "iteration",
      "growth mindset",
    ],
  },

  // Stripe Questions
  {
    id: uuidv4(),
    company: "Stripe",
    role: "Software Engineer",
    question:
      "Design a payment processing system. How would you ensure reliability and handle failures?",
    difficulty: "HARD",
    category: "SYSTEM_DESIGN",
    expectedKeywords: [
      "idempotency",
      "saga pattern",
      "retry logic",
      "dead letter queue",
      "two-phase commit",
      "reconciliation",
    ],
  },
  {
    id: uuidv4(),
    company: "Stripe",
    role: "Software Engineer",
    question:
      "Implement a rate limiter. What algorithms would you consider and why?",
    difficulty: "MEDIUM",
    category: "CODING",
    expectedKeywords: [
      "token bucket",
      "sliding window",
      "Redis",
      "distributed",
      "fixed window",
      "leaky bucket",
    ],
  },
  {
    id: uuidv4(),
    company: "Stripe",
    role: "Software Engineer",
    question:
      "What is the CAP theorem? How does it apply to distributed database design?",
    difficulty: "MEDIUM",
    category: "TECHNICAL",
    expectedKeywords: [
      "consistency",
      "availability",
      "partition tolerance",
      "trade-offs",
      "eventual consistency",
    ],
  },
  {
    id: uuidv4(),
    company: "Stripe",
    role: "Software Engineer",
    question:
      "Why are you interested in working at Stripe? What excites you about fintech?",
    difficulty: "EASY",
    category: "HR",
    expectedKeywords: [
      "mission",
      "impact",
      "financial infrastructure",
      "developer experience",
      "growth",
    ],
  },

  // Uber Questions
  {
    id: uuidv4(),
    company: "Uber",
    role: "Software Engineer",
    question:
      "Design a ride-sharing matching system. How would you optimize for both riders and drivers?",
    difficulty: "HARD",
    category: "SYSTEM_DESIGN",
    expectedKeywords: [
      "geospatial indexing",
      "matching algorithm",
      "ETA",
      "surge pricing",
      "real-time",
      "load balancing",
    ],
  },
  {
    id: uuidv4(),
    company: "Uber",
    role: "Software Engineer",
    question:
      "Find the shortest path between two points on a map. What algorithm would you use and why?",
    difficulty: "MEDIUM",
    category: "CODING",
    expectedKeywords: [
      "Dijkstra",
      "A*",
      "heuristic",
      "graph",
      "priority queue",
      "BFS",
    ],
  },
  {
    id: uuidv4(),
    company: "Uber",
    role: "Software Engineer",
    question:
      "Explain microservices architecture. What are the challenges of migrating from a monolith?",
    difficulty: "MEDIUM",
    category: "TECHNICAL",
    expectedKeywords: [
      "service discovery",
      "API gateway",
      "data consistency",
      "deployment",
      "monitoring",
      "bounded context",
    ],
  },
  {
    id: uuidv4(),
    company: "Uber",
    role: "Software Engineer",
    question:
      "Tell me about a time when you had to work with ambiguous requirements. How did you proceed?",
    difficulty: "MEDIUM",
    category: "BEHAVIORAL",
    expectedKeywords: [
      "clarification",
      "assumptions",
      "stakeholders",
      "iteration",
      "documentation",
    ],
  },
];

// Available job roles for frontend dropdown
export const JOB_ROLES = [
  "Software Engineer",
  "Software Development Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "DevOps Engineer",
  "Data Scientist",
  "Machine Learning Engineer",
  "Product Manager",
  "Data Analyst",
  "QA Engineer",
  "Mobile Developer",
  "Cloud Architect",
  "Security Engineer",
] as const;

// Available companies
export const COMPANIES = [
  "Google",
  "Amazon",
  "Microsoft",
  "Meta",
  "Apple",
  "Netflix",
  "Stripe",
  "Uber",
] as const;

/**
 * Seed the vector database with company questions
 */
export const seedCompanyQuestions = async (): Promise<{
  success: boolean;
  questionsIndexed: number;
  error?: string;
}> => {
  try {
    console.log("Starting to seed company questions...");
    const vectorIds = await indexCompanyQuestions(SEED_COMPANY_QUESTIONS);
    console.log(`Successfully indexed ${vectorIds.length} company questions`);

    return {
      success: true,
      questionsIndexed: vectorIds.length,
    };
  } catch (error: any) {
    console.error("Failed to seed company questions:", error);
    return {
      success: false,
      questionsIndexed: 0,
      error: error.message,
    };
  }
};

export default {
  seedCompanyQuestions,
  SEED_COMPANY_QUESTIONS,
  JOB_ROLES,
  COMPANIES,
};
