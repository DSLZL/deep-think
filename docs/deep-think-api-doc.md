# Deep Think API Documentation

## Overview

The Deep Think API provides a real-time interface for running DeepThink and UltraThink reasoning engines. Leveraging Server-Sent Events (SSE), it delivers thinking progress, solutions, verifications, and errors as they occur.

**Note:** This API **DOES NOT** support Deep Research. For Deep Research functionality, use `/api/sse` instead.

## Protocol

This API uses **Server-Sent Events (SSE)** over HTTP.

## Endpoint

`POST /api/sse/think`

## Request Parameters

### Body (JSON)

```typescript
interface ThinkAPIRequest {
  // Required: Thinking mode
  mode: "deep-think" | "ultra-think";
  
  // Required: The problem to solve
  problemStatement: string;
  
  // Required: AI provider
  provider: string; // "google" | "openai" | "anthropic" | "deepseek" | "xai" | "mistral" | etc.
  
  // Required: Model for thinking
  thinkingModel: string;
  
  // Optional: Different models for different stages
  modelStages?: {
    initial?: string;           // Initial thinking stage
    improvement?: string;       // Self-improvement stage
    verification?: string;      // Verification stage (use cheaper model here)
    correction?: string;        // Correction stage
    planning?: string;          // UltraThink: Planning stage
    agentConfig?: string;       // UltraThink: Agent config generation
    agentThinking?: string;     // UltraThink: Agent parallel thinking
    synthesis?: string;         // UltraThink: Result synthesis
  };
  
  // Optional: Additional prompts/constraints
  otherPrompts?: string[];
  
  // Optional: Knowledge context to enhance thinking
  knowledgeContext?: string;
  
  // Optional: Maximum iterations (default: 30)
  maxIterations?: number;
  
  // Optional: Required successful verifications to complete (default: 3)
  requiredSuccessfulVerifications?: number;
  
  // Optional: Maximum errors before giving up (default: 10)
  maxErrorsBeforeGiveUp?: number;
  
  // Optional: Number of parallel agents (for ultra-think mode, default: 5)
  numAgents?: number;
  
  // Optional: Enable web search (default: false)
  enableWebSearch?: boolean;
}
```

### Headers

```typescript
interface Headers {
  "Content-Type": "application/json";
  // If you set an access password
  // Authorization: "Bearer YOUR_ACCESS_PASSWORD";
}
```

## Response Events

The API streams data as a series of SSE events.

### Event Types

- `info`: API information
- `progress`: Thinking progress updates
- `solution`: Generated solutions
- `agent-update`: Agent status updates (ultra-think mode only)
- `result`: Final result
- `success`: Successful completion
- `error`: Error messages
- `done`: Stream completed

---

### `info` Event

Sent at the beginning to provide API instance information.

**Data Structure:**

```typescript
interface InfoEvent {
  name: string;      // "deep-think-api"
  version: string;   // API version
  mode: string;      // "deep-think" | "ultra-think"
}
```

**Example:**

```text
event: info
data: {"name":"deep-think-api","version":"1.0.0","mode":"deep-think"}
```

---

### `progress` Event

Indicates the current progress of the thinking process.

**Data Structure:**

```typescript
interface ProgressEvent {
  type: "init" | "thinking" | "verification" | "correction" | "general";
  message: string;
  data?: any;
}
```

**Example:**

```text
event: progress
data: {"type":"thinking","message":"Thinking (iteration 1, phase: initial-exploration)","data":{"iteration":1,"phase":"initial-exploration"}}

event: progress
data: {"type":"verification","message":"Verification passed (iteration 2)","data":{"passed":true,"iteration":2}}
```

---

### `solution` Event

Delivers generated solutions during the thinking process.

**Data Structure:**

```typescript
interface SolutionEvent {
  iteration: number;
  solution: string; // The solution text
}
```

**Example:**

```text
event: solution
data: {"iteration":1,"solution":"To solve this problem, we can use..."}
```

---

### `agent-update` Event

(Ultra-Think mode only) Updates the status of individual agents.

**Data Structure:**

```typescript
interface AgentUpdateEvent {
  agentId: string;
  approach?: string;
  specificPrompt?: string;
  status?: "pending" | "thinking" | "verifying" | "completed" | "failed";
  progress?: number; // 0-100
  solution?: string;
  error?: string;
}
```

**Example:**

```text
event: agent-update
data: {"agentId":"agent_01","status":"thinking","progress":30}

event: agent-update
data: {"agentId":"agent_01","status":"completed","progress":100,"solution":"Final solution from agent 1"}
```

---

### `result` Event

Sent when the thinking process completes, containing the final result.

**Data Structure (Deep Think):**

```typescript
interface DeepThinkResult {
  mode: "deep-think";
  initialThought: string;
  improvements: any[];
  iterations: Array<{
    iteration: number;
    solution: string;
    verification: {
      timestamp: number;
      passed: boolean;
      bugReport: string;
      goodVerify: string;
    };
    status: string;
  }>;
  verifications: Array<{
    timestamp: number;
    passed: boolean;
    bugReport: string;
    goodVerify: string;
  }>;
  finalSolution: string;
  totalIterations: number;
  successfulVerifications: number;
}
```

**Data Structure (Ultra Think):**

```typescript
interface UltraThinkResult {
  mode: "ultra-think";
  plan: string;
  agentResults: Array<{
    agentId: string;
    approach: string;
    specificPrompt: string;
    status: string;
    progress: number;
    solution?: string;
    error?: string;
  }>;
  synthesis: string;
  finalSolution: string;
  totalAgents: number;
  completedAgents: number;
}
```

**Example:**

```text
event: result
data: {"mode":"deep-think","finalSolution":"...","totalIterations":5,...}
```

---

### `success` Event

Indicates successful completion.

**Data Structure:**

```typescript
interface SuccessEvent {
  message: string;
  data?: any;
}
```

**Example:**

```text
event: success
data: {"message":"Successfully completed!","data":{"solution":"...","iterations":5}}
```

---

### `error` Event

Sent when an error occurs.

**Data Structure:**

```typescript
interface ErrorEvent {
  message: string;
  data?: any;
}
```

**Example:**

```text
event: error
data: {"message":"Failed: Too many errors"}
```

---

### `done` Event

Sent when the stream is completed.

**Data Structure:**

```typescript
interface DoneEvent {
  message: string;
}
```

**Example:**

```text
event: done
data: {"message":"Stream completed"}
```

---

## Client Code Example

### Deep Think Mode

```typescript
import { fetchEventSource } from "@microsoft/fetch-event-source";

const ctrl = new AbortController();

let finalResult = null;

fetchEventSource("http://localhost:3000/api/sse/think", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    // If you set an access password
    // Authorization: "Bearer YOUR_PASSWORD",
  },
  body: JSON.stringify({
    mode: "deep-think",
    problemStatement: "Solve the equation: x^2 + 5x + 6 = 0",
    provider: "openai",
    thinkingModel: "o1-mini",
    maxIterations: 30,
    requiredSuccessfulVerifications: 3,
  }),
  signal: ctrl.signal,
  
  onmessage(msg) {
    const data = JSON.parse(msg.data);
    
    if (msg.event === "info") {
      console.log("API Info:", data);
    }
    else if (msg.event === "progress") {
      console.log(`[${data.type}] ${data.message}`);
    }
    else if (msg.event === "solution") {
      console.log(`Solution (iteration ${data.iteration}):`, data.solution);
    }
    else if (msg.event === "result") {
      finalResult = data;
      console.log("Final Result:", data);
    }
    else if (msg.event === "success") {
      console.log("✅ Success:", data.message);
    }
    else if (msg.event === "error") {
      console.error("❌ Error:", data.message);
    }
    else if (msg.event === "done") {
      console.log("Stream completed");
    }
  },
  
  onclose() {
    console.log("Connection closed");
    console.log("Final solution:", finalResult?.finalSolution);
  },
  
  onerror(err) {
    console.error("Connection error:", err);
    throw err;
  }
});

// Abort if needed
// ctrl.abort();
```

### Ultra Think Mode

```typescript
import { fetchEventSource } from "@microsoft/fetch-event-source";

const ctrl = new AbortController();
const agents = new Map();
let finalResult = null;

fetchEventSource("http://localhost:3000/api/sse/think", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    mode: "ultra-think",
    problemStatement: "Design a scalable microservices architecture for an e-commerce platform",
    provider: "openai",
    thinkingModel: "gpt-4o",
    numAgents: 5,
    maxIterations: 20,
  }),
  signal: ctrl.signal,
  
  onmessage(msg) {
    const data = JSON.parse(msg.data);
    
    if (msg.event === "info") {
      console.log("API Info:", data);
    }
    else if (msg.event === "progress") {
      console.log(`[${data.type}] ${data.message}`);
    }
    else if (msg.event === "agent-update") {
      agents.set(data.agentId, data);
      console.log(`Agent ${data.agentId}: ${data.status} (${data.progress}%)`);
    }
    else if (msg.event === "result") {
      finalResult = data;
      console.log("Final Result:", data);
      console.log("Synthesis:", data.synthesis);
    }
    else if (msg.event === "success") {
      console.log("✅ Success:", data.message);
    }
    else if (msg.event === "error") {
      console.error("❌ Error:", data.message);
    }
    else if (msg.event === "done") {
      console.log("Stream completed");
    }
  },
  
  onclose() {
    console.log("Connection closed");
    console.log("Agents completed:", finalResult?.completedAgents, "/", finalResult?.totalAgents);
    console.log("Final solution:", finalResult?.finalSolution);
  },
  
  onerror(err) {
    console.error("Connection error:", err);
    throw err;
  }
});
```

### Using Different Models for Different Stages

You can optimize costs by using cheaper models for verification stages while using powerful models for critical thinking:

```typescript
import { fetchEventSource } from "@microsoft/fetch-event-source";

const ctrl = new AbortController();

fetchEventSource("http://localhost:3000/api/sse/think", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    mode: "deep-think",
    problemStatement: "Prove that the square root of 2 is irrational",
    provider: "openai",
    thinkingModel: "gpt-4o",  // Default model for all stages
    // Override specific stages with different models
    modelStages: {
      initial: "gpt-4o",           // Use powerful model for initial thinking
      improvement: "gpt-4o",       // Use powerful model for improvement
      verification: "gpt-4o-mini", // Use cheaper model for verification (saves money!)
      correction: "gpt-4o",        // Use powerful model when correcting errors
    },
    maxIterations: 30,
    requiredSuccessfulVerifications: 3,
  }),
  signal: ctrl.signal,
  
  onmessage(msg) {
    const data = JSON.parse(msg.data);
    
    if (msg.event === "progress") {
      console.log(`[${data.type}] ${data.message}`);
    }
    else if (msg.event === "result") {
      console.log("Final Result:", data);
    }
  },
  
  onclose() {
    console.log("Connection closed");
  },
  
  onerror(err) {
    console.error("Connection error:", err);
    throw err;
  }
});
```

**For UltraThink mode**, you can also configure models for additional stages:

```typescript
body: JSON.stringify({
  mode: "ultra-think",
  problemStatement: "Design a distributed consensus algorithm",
  provider: "openai",
  thinkingModel: "gpt-4o",
  modelStages: {
    // DeepThink stages (used by each agent)
    verification: "gpt-4o-mini",    // Cheaper model for verification
    // UltraThink-specific stages
    planning: "gpt-4o",              // Planning the multi-agent approach
    agentConfig: "gpt-4o-mini",      // Generating agent configurations
    agentThinking: "gpt-4o",         // Each agent's deep thinking
    synthesis: "gpt-4o",             // Synthesizing all agent results
  },
  numAgents: 5,
})
```

**Cost Optimization Tips:**
- Verification happens frequently → use cheaper models (e.g., `gpt-4o-mini`, `gemini-flash`)
- Agent config generation is lightweight → use cheaper models
- Critical thinking & synthesis → use powerful models

## Supported Providers

```
google, openai, anthropic, deepseek, xai, mistral, 
azure, openrouter, openaicompatible, pollinations, ollama
```

## Error Handling

Clients should always listen for the `error` event. Upon receiving an error, the client should handle it appropriately and consider the current thinking task terminated.

## Key Differences from Deep Research API

| Feature | Deep Think API | Deep Research API |
|---------|----------------|-------------------|
| Endpoint | `/api/sse/think` | `/api/sse` |
| Purpose | Rigorous reasoning & verification | Information gathering & research |
| Modes | `deep-think`, `ultra-think` | Deep research only |
| Verification | ✅ Built-in verification loop | ❌ No verification |
| Parallel Agents | ✅ (Ultra Think mode) | ❌ |
| Search Integration | 🔸 Optional | ✅ Core feature |
| Output | Verified solution | Research report |

## Best Practices

1. **Choose the right mode**:
   - `deep-think`: For mathematical problems, logic puzzles, algorithm design
   - `ultra-think`: For complex open-ended problems requiring multiple perspectives

2. **Set appropriate parameters**:
   - Higher `maxIterations` for complex problems
   - `requiredSuccessfulVerifications: 3` is recommended for rigorous verification
   - `numAgents: 3-10` for ultra-think mode

3. **Optimize costs with `modelStages`**:
   - Use cheaper models for verification stages (e.g., `gpt-4o-mini`, `gemini-flash`)
   - Verification happens in every iteration, so this can save significant costs
   - Keep powerful models for critical thinking stages

4. **Monitor progress**: Listen to `progress` and `solution` events to understand the thinking process

4. **Handle long-running tasks**: Deep Think can take several minutes, ensure proper timeout settings

5. **Knowledge context**: Provide relevant context via `knowledgeContext` to improve thinking quality

## Notes

- This API uses the same verification mechanism as the IMO25 paper
- Deep Think requires significant compute time - be patient
- Ultra Think runs multiple agents in parallel, consuming more resources
- Web search is optional and works best with models that support it (e.g., gpt-4o)

