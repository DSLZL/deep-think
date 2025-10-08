import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import useModelProvider from "@/hooks/useAiProvider";
import { useGlobalStore } from "@/store/global";
import { useSettingStore } from "@/store/setting";
import {
  runDeepThink,
  runUltraThink,
  type DeepThinkProgressEvent,
} from "@/utils/deep-think";
import { parseError } from "@/utils/error";
import { isNetworkingModel } from "@/utils/model";

function useDeepThinkEngine() {
  const { t } = useTranslation();
  const { createModelProvider, getModel } = useModelProvider();
  const [status, setStatus] = useState<string>("");

  function handleError(error: unknown) {
    console.error(error);
    const errorMessage = parseError(error);
    toast.error(errorMessage);
  }

  function handleProgress(event: DeepThinkProgressEvent) {
    const {
      setCurrentIteration,
      setCurrentPhase,
      setCurrentSolution,
    } = useGlobalStore.getState();

    switch (event.type) {
      case "init":
        setStatus(t("deepThink.status.initializing"));
        setCurrentIteration(0);
        setCurrentPhase("initializing");
        break;
      case "thinking":
        setCurrentIteration(event.data.iteration);
        setCurrentPhase(event.data.phase);
        setStatus(
          t("deepThink.status.thinking", {
            iteration: event.data.iteration,
            phase: event.data.phase,
          })
        );
        break;
      case "solution":
        setCurrentSolution(event.data.solution);
        setStatus(
          t("deepThink.status.generatedSolution", {
            iteration: event.data.iteration,
          })
        );
        break;
      case "verification":
        setStatus(
          t("deepThink.status.verification", {
            result: event.data.passed ? t("deepThink.verification.passed") : t("deepThink.verification.failed"),
          })
        );
        break;
      case "correction":
        setCurrentIteration(event.data.iteration);
        setCurrentPhase("correcting");
        setStatus(
          t("deepThink.status.correcting", {
            iteration: event.data.iteration,
          })
        );
        break;
      case "success":
        setStatus(t("deepThink.status.success"));
        toast.success(t("deepThink.status.success"));
        break;
      case "failure":
        setStatus(t("deepThink.status.failure"));
        toast.error(t("deepThink.status.failure"));
        break;
      case "progress":
        setStatus(event.data.message);
        break;
    }
  }

  async function runDeepThinkMode(
    problemStatement: string,
    otherPrompts: string[] = [],
    knowledgeContext?: string
  ): Promise<DeepThinkResult | null> {
    try {
      const { model } = getModel();
      const { 
        enableSearch, 
        searchProvider,
        enableModelStages,
        modelStageInitial,
        modelStageImprovement,
        modelStageVerification,
        modelStageCorrection,
      } = useSettingStore.getState();

      // 检查模型是否支持网页搜索
      const enableWebSearch = enableSearch && 
        searchProvider === "model" && 
        isNetworkingModel(model);

      // 构建分阶段模型配置
      const modelStages = enableModelStages === "enable" ? {
        initial: modelStageInitial || undefined,
        improvement: modelStageImprovement || undefined,
        verification: modelStageVerification || undefined,
        correction: modelStageCorrection || undefined,
      } : undefined;

      const result = await runDeepThink({
        problemStatement,
        otherPrompts,
        knowledgeContext,
        enableWebSearch: enableWebSearch || undefined,
        searchProvider: enableWebSearch ? { provider: "model", maxResult: 5 } : undefined,
        createModelProvider,
        thinkingModel: model,
        modelStages,
        onProgress: handleProgress,
      });

      return result;
    } catch (err) {
      handleError(err);
      return null;
    }
  }

  async function runUltraThinkMode(
    problemStatement: string,
    numAgents?: number, // Optional: if not set, LLM decides
    otherPrompts: string[] = [],
    knowledgeContext?: string
  ): Promise<UltraThinkResult | null> {
    try {
      const { model } = getModel();
      const { setAgentResults, updateAgentResult } = useGlobalStore.getState();
      const { 
        enableSearch, 
        searchProvider,
        enableModelStages,
        modelStageInitial,
        modelStageImprovement,
        modelStageVerification,
        modelStageCorrection,
        modelStagePlanning,
        modelStageAgentConfig,
        modelStageAgentThinking,
        modelStageSynthesis,
      } = useSettingStore.getState();

      // 检查模型是否支持网页搜索
      const enableWebSearch = enableSearch && 
        searchProvider === "model" && 
        isNetworkingModel(model);

      // 构建分阶段模型配置
      const modelStages = enableModelStages === "enable" ? {
        initial: modelStageInitial || undefined,
        improvement: modelStageImprovement || undefined,
        verification: modelStageVerification || undefined,
        correction: modelStageCorrection || undefined,
        planning: modelStagePlanning || undefined,
        agentConfig: modelStageAgentConfig || undefined,
        agentThinking: modelStageAgentThinking || undefined,
        synthesis: modelStageSynthesis || undefined,
      } : undefined;

      // 初始化 agents - 如果指定了 numAgents，预先创建占位符
      if (numAgents) {
        const initialAgents: AgentResult[] = Array.from(
          { length: numAgents },
          (_, i) => ({
            agentId: `agent_${String(i + 1).padStart(2, "0")}`,
            approach: "准备中...",
            specificPrompt: "",
            status: "pending",
            progress: 0,
          })
        );
        setAgentResults(initialAgents);
      } else {
        // 如果没指定，清空之前的结果，等 LLM 决定
        setAgentResults([]);
      }

      const result = await runUltraThink({
        problemStatement,
        otherPrompts,
        knowledgeContext,
        enableWebSearch: enableWebSearch || undefined,
        searchProvider: enableWebSearch ? { provider: "model", maxResult: 5 } : undefined,
        numAgents, // Can be undefined - LLM will decide
        createModelProvider,
        thinkingModel: model,
        modelStages,
        onProgress: handleProgress,
        onAgentUpdate: (agentId: string, update: Partial<AgentResult>) => {
          updateAgentResult(agentId, update);
        },
      });

      return result;
    } catch (err) {
      handleError(err);
      return null;
    }
  }

  return {
    status,
    runDeepThinkMode,
    runUltraThinkMode,
  };
}

export default useDeepThinkEngine;

