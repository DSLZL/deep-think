"use client";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Circle, Loader2, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThinkingStep {
  id: string;
  label: string;
  status: "pending" | "running" | "completed" | "failed";
  detail?: string;
}

interface ThinkingProcessProps {
  steps: ThinkingStep[];
  className?: string;
}

export default function ThinkingProcess({
  steps,
  className,
}: ThinkingProcessProps) {
  const { t } = useTranslation();

  const getIcon = (status: ThinkingStep["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "running":
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "pending":
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: ThinkingStep["status"]) => {
    switch (status) {
      case "completed":
        return "text-green-600 dark:text-green-400";
      case "running":
        return "text-blue-600 dark:text-blue-400";
      case "failed":
        return "text-red-600 dark:text-red-400";
      case "pending":
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="font-semibold text-lg">
        {t("deepThink.process.title")}
      </h3>
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={cn(
              "flex items-start gap-3 p-3 rounded-md transition-all",
              step.status === "running" && "bg-blue-50 dark:bg-blue-900/10",
              step.status === "completed" && "bg-green-50 dark:bg-green-900/10",
              step.status === "failed" && "bg-red-50 dark:bg-red-900/10"
            )}
          >
            <div className="flex-shrink-0 mt-0.5">{getIcon(step.status)}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className={cn("font-medium", getStatusColor(step.status))}>
                  {step.label}
                </span>
                {step.status === "running" && (
                  <span className="text-xs text-gray-500">
                    {t("deepThink.process.inProgress")}
                  </span>
                )}
              </div>
              {step.detail && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {step.detail}
                </p>
              )}
            </div>
            {index < steps.length - 1 && step.status !== "pending" && (
              <div className="absolute left-[1.15rem] mt-8 w-0.5 h-8 bg-gray-200 dark:bg-gray-700 -z-10" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Iteration display component for Deep Think mode
interface IterationDisplayProps {
  iterations: DeepThinkIteration[];
  currentIteration: number;
  className?: string;
}

export function IterationDisplay({
  iterations,
  currentIteration,
  className,
}: IterationDisplayProps) {
  const { t } = useTranslation();

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">
          {t("deepThink.iteration.title")}
        </h4>
        <span className="text-sm text-gray-500">
          {t("deepThink.iteration.current", { iteration: currentIteration })}
        </span>
      </div>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {iterations.map((iter) => (
          <div
            key={iter.iteration}
            className={cn(
              "p-3 border rounded-md",
              iter.status === "completed" && "border-green-300 bg-green-50 dark:bg-green-900/10",
              iter.status === "verifying" && "border-blue-300 bg-blue-50 dark:bg-blue-900/10",
              iter.status === "correcting" && "border-yellow-300 bg-yellow-50 dark:bg-yellow-900/10",
              iter.status === "failed" && "border-red-300 bg-red-50 dark:bg-red-900/10"
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">
                {t("deepThink.iteration.number", { number: iter.iteration })}
              </span>
              <span className="text-xs px-2 py-1 rounded-full bg-white dark:bg-gray-800">
                {t(`deepThink.iteration.status.${iter.status}`)}
              </span>
            </div>
            {iter.verification && (
              <div className="flex items-start gap-2 text-sm">
                {iter.verification.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                )}
                <span className="text-gray-600 dark:text-gray-400">
                  {iter.verification.passed
                    ? t("deepThink.verification.passed")
                    : t("deepThink.verification.failed")}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

