// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require("pdf-parse");
import axios from "axios";

export interface ParsedResume {
  rawText: string;
  metadata: {
    pageCount: number;
    info: any;
  };
  extractedSections: {
    skills: string[];
    experience: string[];
    education: string[];
    projects: string[];
    certifications: string[];
    summary: string;
  };
}

// Common skill keywords for extraction
const SKILL_PATTERNS = [
  // Programming Languages
  /\b(JavaScript|TypeScript|Python|Java|C\+\+|C#|Ruby|Go|Rust|PHP|Swift|Kotlin|Scala|R|MATLAB)\b/gi,
  // Frameworks & Libraries
  /\b(React|Angular|Vue|Node\.js|Express|Django|Flask|Spring|\.NET|Rails|Laravel|FastAPI|Next\.js|Nest\.js)\b/gi,
  // Databases
  /\b(MySQL|PostgreSQL|MongoDB|Redis|Elasticsearch|Cassandra|DynamoDB|SQLite|Oracle|SQL Server|Firebase)\b/gi,
  // Cloud & DevOps
  /\b(AWS|Azure|GCP|Docker|Kubernetes|Jenkins|CI\/CD|Terraform|Ansible|Linux|Git|GitHub|GitLab)\b/gi,
  // AI/ML
  /\b(Machine Learning|Deep Learning|TensorFlow|PyTorch|Scikit-learn|NLP|Computer Vision|OpenAI|LangChain)\b/gi,
  // Other
  /\b(REST|GraphQL|Microservices|Agile|Scrum|JIRA|Figma|Photoshop|Excel|Power BI|Tableau)\b/gi,
];

// Section headers for parsing
const SECTION_HEADERS = {
  experience:
    /\b(experience|work history|employment|professional background)\b/i,
  education: /\b(education|academic|qualifications|degree)\b/i,
  skills: /\b(skills|technical skills|technologies|competencies|expertise)\b/i,
  projects: /\b(projects|portfolio|work samples)\b/i,
  certifications: /\b(certifications|certificates|licenses|credentials)\b/i,
  summary: /\b(summary|objective|profile|about me|professional summary)\b/i,
};

/**
 * Parse a PDF file and extract structured information
 */
export const parseResumePDF = async (
  pdfBuffer: Buffer
): Promise<ParsedResume> => {
  try {
    const data = await pdfParse(pdfBuffer);
    const rawText = data.text;

    // Extract skills using patterns
    const skills = extractSkills(rawText);

    // Extract sections
    const sections = extractSections(rawText);

    return {
      rawText,
      metadata: {
        pageCount: data.numpages,
        info: data.info,
      },
      extractedSections: {
        skills,
        experience: sections.experience,
        education: sections.education,
        projects: sections.projects,
        certifications: sections.certifications,
        summary: sections.summary,
      },
    };
  } catch (error: any) {
    console.error("PDF parsing error:", error);
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
};

/**
 * Parse a PDF from a URL
 */
export const parseResumeFromUrl = async (
  url: string
): Promise<ParsedResume> => {
  try {
    const response = await axios.get(url, {
      responseType: "arraybuffer",
    });
    const buffer = Buffer.from(response.data);
    return parseResumePDF(buffer);
  } catch (error: any) {
    console.error("PDF fetch error:", error);
    throw new Error(`Failed to fetch PDF from URL: ${error.message}`);
  }
};

/**
 * Extract skills from resume text
 */
const extractSkills = (text: string): string[] => {
  const skillSet = new Set<string>();

  for (const pattern of SKILL_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach((skill) => skillSet.add(skill));
    }
  }

  return Array.from(skillSet);
};

/**
 * Extract sections from resume text
 */
const extractSections = (
  text: string
): {
  experience: string[];
  education: string[];
  projects: string[];
  certifications: string[];
  summary: string;
} => {
  const lines = text.split("\n").filter((line) => line.trim());

  const result = {
    experience: [] as string[],
    education: [] as string[],
    projects: [] as string[],
    certifications: [] as string[],
    summary: "",
  };

  let currentSection: keyof typeof result | null = null;
  let summaryLines: string[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Check if this line is a section header
    let foundSection = false;
    for (const [section, pattern] of Object.entries(SECTION_HEADERS)) {
      if (pattern.test(trimmedLine)) {
        currentSection = section as keyof typeof result;
        foundSection = true;
        break;
      }
    }

    if (!foundSection && currentSection && trimmedLine) {
      if (currentSection === "summary") {
        summaryLines.push(trimmedLine);
      } else if (Array.isArray(result[currentSection])) {
        (result[currentSection] as string[]).push(trimmedLine);
      }
    }
  }

  result.summary = summaryLines.slice(0, 5).join(" "); // First 5 lines of summary

  return result;
};

/**
 * Create a searchable text representation for embedding
 */
export const createEmbeddingText = (parsedResume: ParsedResume): string => {
  const parts: string[] = [];

  if (parsedResume.extractedSections.summary) {
    parts.push(
      `Professional Summary: ${parsedResume.extractedSections.summary}`
    );
  }

  if (parsedResume.extractedSections.skills.length > 0) {
    parts.push(
      `Technical Skills: ${parsedResume.extractedSections.skills.join(", ")}`
    );
  }

  if (parsedResume.extractedSections.experience.length > 0) {
    parts.push(
      `Experience: ${parsedResume.extractedSections.experience
        .slice(0, 10)
        .join(". ")}`
    );
  }

  if (parsedResume.extractedSections.education.length > 0) {
    parts.push(
      `Education: ${parsedResume.extractedSections.education
        .slice(0, 5)
        .join(". ")}`
    );
  }

  if (parsedResume.extractedSections.projects.length > 0) {
    parts.push(
      `Projects: ${parsedResume.extractedSections.projects
        .slice(0, 5)
        .join(". ")}`
    );
  }

  // Fallback to raw text if sections are empty
  if (parts.length === 0) {
    return parsedResume.rawText.slice(0, 8000); // First 8000 chars
  }

  return parts.join("\n\n");
};

export default {
  parseResumePDF,
  parseResumeFromUrl,
  createEmbeddingText,
};
