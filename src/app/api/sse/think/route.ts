import { NextResponse, type NextRequest } from "next/server";
import { runDeepThink, runUltraThink } from "@/utils/deep-think";
import { createAIProvider } from "@/utils/deep-research/provider";
import { multiApiKeyPolling } from "@/utils/model";
import { getAIProviderBaseURL, getAIProviderApiKey } from "../../utils";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const preferredRegion = [
  "cle1",
  "iad1",
  "pdx1",
  "sfo1",
  "sin1",
  "syd1",
  "hnd1",
  "kix1",
];

export async function POST(req: NextRequest) {
  const {
    mode = "deep-think", // "deep-think" | "ultra-think"
    problemStatement,
    provider,
    thinkingModel,
    modelStages, // Optional: Different models for different stages
    otherPrompts = [],
    knowledgeContext,
    maxIterations = 30,
    requiredSuccessfulVerifications = 3,
    maxErrorsBeforeGiveUp = 10,
    numAgents, // Optional: For ultra-think mode, if not set LLM decides
    enableWebSearch = false,
  } = await req.json();

  const encoder = new TextEncoder();
  const readableStream = new ReadableStream({
    start: async (controller) => {
      console.log("Client connected");
      controller.enqueue(
        encoder.encode(
          `event: info\ndata: ${JSON.stringify({
            name: "deep-think-api",
            version: "1.0.0",
            mode,
          })}\n\n`
        )
      );

      // Create model provider factory
      async function createModelProvider(model: string, settings?: any) {
        return await createAIProvider({
          provider,
          baseURL: getAIProviderBaseURL(provider),
          apiKey: multiApiKeyPolling(getAIProviderApiKey(provider)),
          model,
          settings,
        });
      }

      // Event handler to send SSE events
      function sendEvent(event: string, data: any) {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      }

      // Progress handler
      function handleProgress(event: any) {
        switch (event.type) {
          case "init":
            sendEvent("progress", {
              type: "init",
              message: "Initializing...",
              data: event.data,
            });
            break;
          case "thinking":
            sendEvent("progress", {
              type: "thinking",
              message: `Thinking (iteration ${event.data.iteration}, phase: ${event.data.phase})`,
              data: event.data,
            });
            break;
          case "solution":
            sendEvent("solution", {
              iteration: event.data.iteration,
              solution: event.data.solution,
            });
            break;
          case "verification":
            sendEvent("progress", {
              type: "verification",
              message: `Verification ${
                event.data.passed ? "passed" : "failed"
              } (iteration ${event.data.iteration})`,
              data: event.data,
            });
            break;
          case "correction":
            sendEvent("progress", {
              type: "correction",
              message: `Correcting solution (iteration ${event.data.iteration})`,
              data: event.data,
            });
            break;
          case "success":
            sendEvent("success", {
              message: "Successfully completed!",
              data: event.data,
            });
            break;
          case "failure":
            sendEvent("error", {
              message: `Failed: ${event.data.reason}`,
              data: event.data,
            });
            break;
          case "progress":
            sendEvent("progress", {
              type: "general",
              message: event.data.message,
              data: event.data,
            });
            break;
        }
      }

      req.signal.addEventListener("abort", () => {
        controller.close();
      });

      try {
        let result;

        if (mode === "ultra-think") {
          // Ultra Think mode - multiple agents
          sendEvent("progress", {
            type: "init",
            message: numAgents 
              ? `Starting Ultra Think with ${numAgents} agents...`
              : "Starting Ultra Think with auto-determined agents...",
          });

          result = await runUltraThink({
            problemStatement,
            otherPrompts,
            knowledgeContext,
            maxIterations,
            requiredSuccessfulVerifications,
            maxErrorsBeforeGiveUp,
            numAgents,
            enableWebSearch,
            createModelProvider,
            thinkingModel,
            modelStages,
            onProgress: handleProgress,
            onAgentUpdate: (agentId: string, update: Partial<AgentResult>) => {
              sendEvent("agent-update", {
                agentId,
                ...update,
              });
            },
          });
        } else {
          // Deep Think mode - single agent
          sendEvent("progress", {
            type: "init",
            message: "Starting Deep Think...",
          });

          result = await runDeepThink({
            problemStatement,
            otherPrompts,
            knowledgeContext,
            maxIterations,
            requiredSuccessfulVerifications,
            maxErrorsBeforeGiveUp,
            enableWebSearch,
            createModelProvider,
            thinkingModel,
            modelStages,
            onProgress: handleProgress,
          });
        }

        // Send final result
        sendEvent("result", result);
        sendEvent("done", { message: "Stream completed" });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        console.error("Deep Think error:", err);
        sendEvent("error", { message: errorMessage });
      }

      controller.close();
    },
  });

  return new NextResponse(readableStream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

