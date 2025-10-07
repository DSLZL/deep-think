interface Resource {
  id: string;
  name: string;
  type: string;
  size: number;
  status: "unprocessed" | "processing" | "completed" | "failed";
}

interface FileMeta {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

interface Knowledge {
  id: string;
  title: string;
  content: string;
  type: "file" | "url" | "knowledge";
  fileMeta?: FileMeta;
  url?: string;
  createdAt: number;
  updatedAt: number;
}

interface ImageSource {
  url: string;
  description?: string;
}

interface Source {
  title?: string;
  content?: string;
  url: string;
  images?: ImageSource[];
}

interface SearchTask {
  state: "unprocessed" | "processing" | "completed" | "failed";
  query: string;
  researchGoal: string;
  learning: string;
  sources: Source[];
  images: ImageSource[];
}

interface PartialJson {
  value: JSONValue | undefined;
  state:
    | "undefined-input"
    | "successful-parse"
    | "repaired-parse"
    | "failed-parse";
}

interface WebSearchResult {
  content: string;
  url: string;
  title?: string;
}

// Deep Think Mode Types
type ThinkMode = "deep-think" | "ultra-think";

interface Verification {
  timestamp: number;
  passed: boolean;
  bugReport: string;
  goodVerify: string;
}

interface DeepThinkIteration {
  iteration: number;
  solution: string;
  verification: Verification;
  status: "thinking" | "verifying" | "correcting" | "completed" | "failed";
}

interface DeepThinkResult {
  mode: "deep-think";
  initialThought: string;
  improvements: string[];
  iterations: DeepThinkIteration[];
  verifications: Verification[];
  finalSolution: string;
  totalIterations: number;
  successfulVerifications: number;
}

interface AgentResult {
  agentId: string;
  approach: string;
  specificPrompt: string;
  status: "pending" | "thinking" | "verifying" | "completed" | "failed";
  progress: number;
  solution?: string;
  verifications?: Verification[];
  error?: string;
}

interface UltraThinkResult {
  mode: "ultra-think";
  plan: string;
  agentResults: AgentResult[];
  synthesis: string;
  finalSolution: string;
  totalAgents: number;
  completedAgents: number;
}

type ThinkResult = DeepThinkResult | UltraThinkResult;