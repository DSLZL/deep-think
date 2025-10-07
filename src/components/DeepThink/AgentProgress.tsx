"use client";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Loader2, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface AgentProgressProps {
  agents: AgentResult[];
  className?: string;
}

export default function AgentProgress({
  agents,
  className,
}: AgentProgressProps) {
  const { t } = useTranslation();

  const getStatusIcon = (status: AgentResult["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "thinking":
      case "verifying":
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "pending":
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: AgentResult["status"]) => {
    switch (status) {
      case "completed":
        return "border-green-300 bg-green-50 dark:bg-green-900/10";
      case "thinking":
      case "verifying":
        return "border-blue-300 bg-blue-50 dark:bg-blue-900/10";
      case "failed":
        return "border-red-300 bg-red-50 dark:bg-red-900/10";
      case "pending":
      default:
        return "border-gray-200 dark:border-gray-700";
    }
  };

  const completedCount = agents.filter((a) => a.status === "completed").length;
  const totalCount = agents.length;
  const overallProgress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">
            {t("deepThink.agent.title")}
          </h3>
          <span className="text-sm text-gray-500">
            {t("deepThink.agent.progress", {
              completed: completedCount,
              total: totalCount,
            })}
          </span>
        </div>
        <Progress value={overallProgress} className="h-2" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {agents.map((agent) => (
          <div
            key={agent.agentId}
            className={cn(
              "p-4 border rounded-md transition-all",
              getStatusColor(agent.status)
            )}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-shrink-0 mt-0.5">
                {getStatusIcon(agent.status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium truncate">{agent.agentId}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white dark:bg-gray-800">
                    {t(`deepThink.agent.status.${agent.status}`)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {agent.approach}
                </p>
              </div>
            </div>

            {(agent.status === "thinking" ||
              agent.status === "verifying" ||
              agent.status === "completed") && (
              <div className="space-y-1">
                <Progress value={agent.progress} className="h-1.5" />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{agent.progress}%</span>
                  {agent.verifications && (
                    <span>
                      {t("deepThink.agent.verifications", {
                        count: agent.verifications.length,
                      })}
                    </span>
                  )}
                </div>
              </div>
            )}

            {agent.error && (
              <div className="mt-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                {agent.error}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Compact version for header display
interface AgentProgressCompactProps {
  agents: AgentResult[];
  className?: string;
}

export function AgentProgressCompact({
  agents,
  className,
}: AgentProgressCompactProps) {
  const completedCount = agents.filter((a) => a.status === "completed").length;
  const failedCount = agents.filter((a) => a.status === "failed").length;
  const workingCount = agents.filter(
    (a) => a.status === "thinking" || a.status === "verifying"
  ).length;
  const totalCount = agents.length;

  return (
    <div className={cn("flex items-center gap-4 text-sm", className)}>
      <div className="flex items-center gap-1">
        <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
        <span>{workingCount}</span>
      </div>
      <div className="flex items-center gap-1">
        <CheckCircle2 className="w-4 h-4 text-green-500" />
        <span>{completedCount}</span>
      </div>
      {failedCount > 0 && (
        <div className="flex items-center gap-1">
          <XCircle className="w-4 h-4 text-red-500" />
          <span>{failedCount}</span>
        </div>
      )}
      <span className="text-gray-500">/ {totalCount}</span>
    </div>
  );
}

