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
  questions?: string; // 询问阶段生成的问题
  userAnswers?: string; // 用户的回答
  plan?: string; // 思考计划
  initialThought: string;
  improvements: string[];
  iterations: DeepThinkIteration[];
  verifications: Verification[];
  finalSolution: string;
  summary?: string;
  totalIterations: number;
  successfulVerifications: number;
  sources?: Source[]; // 引用来源追踪
  knowledgeEnhanced?: boolean; // 是否使用了知识增强
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
  questions?: string; // 询问阶段生成的问题
  userAnswers?: string; // 用户的回答
  plan: string;
  agentResults: AgentResult[];
  synthesis: string;
  finalSolution: string;
  summary?: string;
  totalAgents: number;
  completedAgents: number;
  sources?: Source[]; // 引用来源追踪
  knowledgeEnhanced?: boolean; // 是否使用了知识增强
}

type ThinkResult = DeepThinkResult | UltraThinkResult;