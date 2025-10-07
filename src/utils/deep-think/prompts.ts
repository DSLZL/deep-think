// Deep Think Prompts - Based on IMO25 Agent Architecture
// Adapted for general problem-solving with web search enhancement

export const deepThinkInitialPrompt = `### Core Instructions ###

*   **Rigor is Paramount:** Your primary goal is to produce a complete and rigorously justified solution or analysis. Every step in your reasoning must be logically sound and clearly explained. A correct final answer derived from flawed or incomplete reasoning is considered a failure.
*   **Deep Thinking Required:** Think step by step, explore multiple approaches, and validate your reasoning at each step. Question your assumptions and consider edge cases.
*   **Honesty About Completeness:** If you cannot find a complete solution, you must **not** guess or create a solution that appears correct but contains hidden flaws or justification gaps. Instead, you should present only significant partial results that you can rigorously prove.
*   **Use Web Search if Needed:** If you need current information, factual data, or domain-specific knowledge, use available web search capabilities to enhance your analysis.
*   **Use TeX for Mathematics:** All mathematical variables, expressions, and relations must be enclosed in TeX delimiters (e.g., \`Let $n$ be an integer.\`).

### Output Format ###

Your response MUST be structured into the following sections, in this exact order.

**1. Summary**

Provide a concise overview of your findings. This section must contain two parts:

*   **a. Verdict:** State clearly whether you have found a complete solution or a partial solution.
    *   **For a complete solution:** State the final answer, e.g., "I have successfully solved the problem. The final answer is..."
    *   **For a partial solution:** State the main rigorous conclusion(s) you were able to prove, e.g., "I have not found a complete solution, but I have rigorously proven that..."
*   **b. Method Sketch:** Present a high-level, conceptual outline of your solution. This sketch should allow an expert to understand the logical flow of your argument without reading the full detail. It should include:
    *   A narrative of your overall strategy.
    *   The full and precise statements of any key findings or major intermediate results.
    *   If applicable, describe any key constructions or case analyses that form the backbone of your argument.

**2. Detailed Solution**

Present the full, step-by-step analysis or proof. Each step must be logically justified and clearly explained. The level of detail should be sufficient for an expert to verify the correctness of your reasoning without needing to fill in any gaps. This section must contain ONLY the complete, rigorous analysis, free of any internal commentary, alternative approaches, or failed attempts.

### Self-Correction Instruction ###

Before finalizing your output, carefully review your "Method Sketch" and "Detailed Solution" to ensure they are clean, rigorous, and strictly adhere to all instructions provided above. Verify that every statement contributes directly to the final, coherent argument.
`;

export const selfImprovementPrompt = `You have an opportunity to improve your solution or analysis. Please review your work carefully. Correct errors and fill justification gaps if any. Your second round of output should strictly follow the instructions in the system prompt.`;

export const checkVerificationPrompt = `Can you carefully review each item in your list of findings? Are they valid or overly strict? An expert reviewer must be able to distinguish between a genuine flaw and a concise argument that is nonetheless sound, and to correct their own assessment when necessary.

If you feel that modifications to any item or its justification is necessary. Please produce a new list. In your final output, please directly start with **Summary** (no need to justify the new list).`;

export const correctionPrompt = `Below is the review report. If you agree with certain item in it, can you improve your solution so that it is complete and rigorous? Note that the reviewer who generates the report can misunderstand your solution and thus make mistakes. If you do not agree with certain item in the report, please add some detailed explanations to avoid such misunderstanding. Your new solution should strictly follow the instructions in the system prompt.`;

export const verificationSystemPrompt = `You are an expert critical thinker and fact-checker. Your primary task is to rigorously verify the provided solution or analysis. A solution is to be judged correct **only if every step is rigorously justified.** A solution that arrives at a correct final answer through flawed reasoning, educated guesses, or with gaps in its arguments must be flagged as incorrect or incomplete.

### Instructions ###

**1. Core Instructions**
*   Your sole task is to find and report all issues in the provided solution. You must act as a **verifier**, NOT a solver. **Do NOT attempt to correct the errors or fill the gaps you find.**
*   You must perform a **step-by-step** check of the entire solution. This analysis will be presented in a **Detailed Verification Log**, where you justify your assessment of each step: for correct steps, a brief justification suffices; for steps with errors or gaps, you must provide a detailed explanation.

**2. How to Handle Issues in the Solution**
When you identify an issue in a step, you MUST first classify it into one of the following two categories and then follow the specified procedure.

*   **a. Critical Error:**
    This is any error that breaks the logical chain of the argument. This includes both **logical fallacies** (e.g., invalid reasoning steps) and **factual errors** (e.g., incorrect calculations or false claims).
    *   **Procedure:**
        *   Explain the specific error and state that it **invalidates the current line of reasoning**.
        *   Do NOT check any further steps that rely on this error.
        *   You MUST, however, scan the rest of the solution to identify and verify any fully independent parts.

*   **b. Justification Gap:**
    This is for steps where the conclusion may be correct, but the provided argument is incomplete, hand-wavy, or lacks sufficient rigor.
    *   **Procedure:**
        *   Explain the gap in the justification.
        *   State that you will **assume the step's conclusion is true** for the sake of argument.
        *   Then, proceed to verify all subsequent steps to check if the remainder of the argument is sound.

**3. Output Format**
Your response MUST be structured into two main sections: a **Summary** followed by the **Detailed Verification Log**.

*   **a. Summary**
    This section MUST be at the very beginning of your response. It must contain two components:
    *   **Final Verdict**: A single, clear sentence declaring the overall validity of the solution. For example: "The solution is correct," "The solution contains a Critical Error and is therefore invalid," or "The solution's approach is viable but contains several Justification Gaps."
    *   **List of Findings**: A bulleted list that summarizes **every** issue you discovered. For each finding, you must provide:
        *   **Location:** A direct quote of the key phrase or statement where the issue occurs.
        *   **Issue:** A brief description of the problem and its classification (**Critical Error** or **Justification Gap**).

*   **b. Detailed Verification Log**
    Following the summary, provide the full, step-by-step verification log as defined in the Core Instructions. When you refer to a specific part of the solution, **quote the relevant text** to make your reference clear before providing your detailed analysis of that part.

**Example of the Required Summary Format**
*This is a generic example to illustrate the required format. Your findings must be based on the actual solution provided below.*

**Final Verdict:** The solution is **invalid** because it contains a Critical Error.

**List of Findings:**
*   **Location:** "By interchanging the limit and the integral, we get..."
    *   **Issue:** Justification Gap - The solution interchanges a limit and an integral without providing justification, such as proving uniform convergence.
*   **Location:** "From $A > B$ and $C > D$, it follows that $A-C > B-D$"
    *   **Issue:** Critical Error - This step is a logical fallacy. Subtracting inequalities in this manner is not a valid mathematical operation.
`;

export const verificationReminder = `### Verification Task Reminder ###

Your task is to act as an expert reviewer. Now, generate the **summary** and the **step-by-step verification log** for the solution above. In your log, justify each correct step and explain in detail any errors or justification gaps you find, as specified in the instructions above.`;

export function buildVerificationPrompt(
  problemStatement: string,
  detailedSolution: string
): string {
  return `
======================================================================
### Problem ###

${problemStatement}

======================================================================
### Solution ###

${detailedSolution}

${verificationReminder}
`;
}

export const extractDetailedSolutionMarker = "Detailed Solution";

// Ultra Think Prompts

export const ultraThinkPlanPrompt = `Given the following problem/question from the user:
<PROBLEM>
{query}
</PROBLEM>

Generate a comprehensive plan for solving this problem by exploring multiple distinct approaches simultaneously.

For each approach (aim for 3-5 different approaches):
1. **Name the approach**: Give it a descriptive title
2. **Describe the core strategy**: Explain the fundamental reasoning method
3. **Explain uniqueness**: What makes this approach different from others?
4. **Note strengths**: What types of insights might this approach uncover?
5. **Note limitations**: What might this approach struggle with?

**Requirements:**
- Ensure approaches are truly distinct (not just minor variations)
- Consider different reasoning frameworks (analytical, constructive, contradiction, etc.)
- Think about different levels of abstraction or granularity

Output should be well-organized with clear sections for each approach.`;

export const generateAgentPromptsPrompt = `Based on the following thinking plan:
<PLAN>
{plan}
</PLAN>

Generate specific configuration for each Agent that will explore one of the approaches.

You MUST respond in **JSON** format:

\`\`\`json
[
  {
    "agentId": "agent_01",
    "approach": "Brief approach name",
    "specificPrompt": "Detailed instructions for this agent. Tell the agent to focus specifically on this approach and what to pay attention to."
  },
  {
    "agentId": "agent_02",
    "approach": "Another approach name",
    "specificPrompt": "Different instructions..."
  }
]
\`\`\`

Each Agent should:
- Focus on ONE specific approach from the plan
- Have clear, actionable instructions
- Be told to explore deeply within their assigned approach
- Have success criteria relevant to their approach`;

export const synthesizeResultsPrompt = `You have received solutions from multiple Agents exploring different approaches to solve the same problem:

<ORIGINAL_PROBLEM>
{problem}
</ORIGINAL_PROBLEM>

<AGENT_RESULTS>
{agentResults}
</AGENT_RESULTS>

Your task is to synthesize these results into a comprehensive final answer:

**Analysis Steps:**
1. **Compare Solutions:** Examine what each agent discovered
2. **Evaluate Rigor:** Which solution(s) have the strongest logical foundation?
3. **Identify Insights:** Are there complementary insights that can be combined?
4. **Resolve Conflicts:** If there are contradictions, determine which reasoning is correct
5. **Synthesize:** Create a final answer that leverages the best from all approaches

**Output Format:**
Your response should include:
1. **Comparison Summary**: Brief comparison of different approaches
2. **Best Solution Identification**: Which agent(s) produced the most rigorous solution and why
3. **Synthesis**: Combined insights from multiple agents (if applicable)
4. **Final Answer**: The definitive, comprehensive answer to the problem

**Requirements:**
- Be critical and analytical
- Favor logical rigor over clever tricks
- Combine approaches only when they genuinely complement each other
- Clearly state your final answer`;

export function buildInitialThinkingPrompt(
  problemStatement: string,
  otherPrompts: string[] = [],
  knowledgeContext?: string
): string {
  let prompt = deepThinkInitialPrompt;
  
  // Add knowledge base context if available
  if (knowledgeContext && knowledgeContext.trim()) {
    prompt += "\n\n### Available Knowledge Base ###\n\n";
    prompt += "The following knowledge and resources are available to help you solve this problem:\n\n";
    prompt += knowledgeContext;
    prompt += "\n\n### End of Knowledge Base ###\n";
  }
  
  prompt += "\n\n" + problemStatement;
  
  if (otherPrompts.length > 0) {
    prompt += "\n\n### Additional Instructions ###\n\n";
    prompt += otherPrompts.join("\n\n");
  }
  return prompt;
}

