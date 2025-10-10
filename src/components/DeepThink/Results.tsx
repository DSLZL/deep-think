"use client";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronUp, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import MagicDown from "@/components/MagicDown";
import { Button } from "@/components/Internal/Button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface DeepThinkResultsProps {
  result: DeepThinkResult;
  className?: string;
}

export function DeepThinkResults({
  result,
  className,
}: DeepThinkResultsProps) {
  const { t } = useTranslation();
  const [showIterations, setShowIterations] = useState(false);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Summary */}
      <div className="p-4 border rounded-md bg-green-50 dark:bg-green-900/10 border-green-300">
        <div className="flex items-start gap-3 mb-2">
          <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-lg text-green-700 dark:text-green-400">
              {t("deepThink.results.success")}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t("deepThink.results.summary", {
                iterations: result.totalIterations,
                verifications: result.successfulVerifications,
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Clarification Questions & User Answers */}
      {result.questions && (
        <div className="p-4 border rounded-md bg-purple-50 dark:bg-purple-900/10">
          <h3 className="font-semibold text-lg mb-3 text-purple-700 dark:text-purple-400">
            ❓ {t("deepThink.results.questions")}
          </h3>
          <div className="prose dark:prose-invert max-w-none text-sm">
            <MagicDown value={result.questions} onChange={() => {}} />
          </div>
          {result.userAnswers && (
            <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-800">
              <h4 className="font-semibold text-sm mb-2 text-purple-600 dark:text-purple-300">
                💬 {t("deepThink.results.userAnswers")}
              </h4>
              <div className="prose dark:prose-invert max-w-none text-sm">
                <MagicDown value={result.userAnswers} onChange={() => {}} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Thinking Plan */}
      {result.plan && (
        <div className="p-4 border rounded-md bg-amber-50 dark:bg-amber-900/10">
          <h3 className="font-semibold text-lg mb-3 text-amber-700 dark:text-amber-400">
            📋 {t("deepThink.results.thinkingPlan")}
          </h3>
          <div className="prose dark:prose-invert max-w-none text-sm">
            <MagicDown value={result.plan} onChange={() => {}} />
          </div>
        </div>
      )}

      {/* Final Solution - Show summary if available, otherwise show finalSolution */}
      <div className="p-4 border rounded-md">
        <h3 className="font-semibold text-lg mb-3">
          {t("deepThink.results.finalSolution")}
        </h3>
        <div className="prose dark:prose-invert max-w-none">
          <MagicDown value={result.summary || result.finalSolution} onChange={() => {}} />
        </div>
      </div>

      {/* Knowledge Sources - Show if knowledge enhancement was used */}
      {result.sources && result.sources.length > 0 && (
        <div className="p-4 border rounded-md bg-blue-50 dark:bg-blue-900/10">
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <span className="text-blue-600 dark:text-blue-400">🔍</span>
            {t("deepThink.results.knowledgeSources")}
            <span className="text-sm font-normal text-gray-500">
              ({result.sources.length})
            </span>
          </h3>
          <div className="space-y-2">
            {result.sources.map((source, idx) => (
              <div
                key={idx}
                className="p-3 bg-white dark:bg-gray-800 rounded border border-blue-200 dark:border-blue-800"
              >
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 dark:text-blue-400 hover:underline block mb-1"
                >
                  [{idx + 1}] {source.title || source.url}
                </a>
                {source.content && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {source.content}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Iterations Toggle */}
      {result.iterations.length > 0 && (
        <div className="border rounded-md">
          <Button
            variant="ghost"
            className="w-full flex items-center justify-between p-4"
            onClick={() => setShowIterations(!showIterations)}
          >
            <span className="font-semibold">
              {t("deepThink.results.iterationHistory")} ({result.iterations.length})
            </span>
            {showIterations ? <ChevronUp /> : <ChevronDown />}
          </Button>
          {showIterations && (
            <div className="p-4 pt-0 border-t space-y-3 max-h-96 overflow-y-auto">
              {result.iterations.map((iter, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "p-3 border rounded-md",
                    iter.status === "completed" && "border-green-300 bg-green-50 dark:bg-green-900/10"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">
                      {t("deepThink.iteration.number", { number: iter.iteration })}
                    </span>
                    <div className="flex items-center gap-2">
                      {iter.verification.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className="text-xs">
                        {iter.verification.passed
                          ? t("deepThink.verification.passed")
                          : t("deepThink.verification.failed")}
                      </span>
                    </div>
                  </div>
                  {iter.verification.bugReport && (
                    <details className="text-sm mt-2">
                      <summary className="cursor-pointer text-gray-600 dark:text-gray-400">
                        {t("deepThink.results.viewBugReport")}
                      </summary>
                      <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs">
                        {iter.verification.bugReport}
                      </div>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface UltraThinkResultsProps {
  result: UltraThinkResult;
  className?: string;
}

export function UltraThinkResults({
  result,
  className,
}: UltraThinkResultsProps) {
  const { t } = useTranslation();

  return (
    <div className={cn("space-y-4", className)}>
      {/* Summary */}
      <div className="p-4 border rounded-md bg-blue-50 dark:bg-blue-900/10 border-blue-300">
        <div className="flex items-start gap-3 mb-2">
          <CheckCircle2 className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-lg text-blue-700 dark:text-blue-400">
              {t("deepThink.results.ultraThinkComplete")}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t("deepThink.results.ultraSummary", {
                total: result.totalAgents,
                completed: result.completedAgents,
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Clarification Questions & User Answers */}
      {result.questions && (
        <div className="p-4 border rounded-md bg-purple-50 dark:bg-purple-900/10">
          <h3 className="font-semibold text-lg mb-3 text-purple-700 dark:text-purple-400">
            ❓ {t("deepThink.results.questions")}
          </h3>
          <div className="prose dark:prose-invert max-w-none text-sm">
            <MagicDown value={result.questions} onChange={() => {}} />
          </div>
          {result.userAnswers && (
            <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-800">
              <h4 className="font-semibold text-sm mb-2 text-purple-600 dark:text-purple-300">
                💬 {t("deepThink.results.userAnswers")}
              </h4>
              <div className="prose dark:prose-invert max-w-none text-sm">
                <MagicDown value={result.userAnswers} onChange={() => {}} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Final Synthesis - Show summary if available, otherwise show synthesis */}
      <div className="p-4 border rounded-md">
        <h3 className="font-semibold text-lg mb-3">
          {t("deepThink.results.synthesis")}
        </h3>
        <div className="prose dark:prose-invert max-w-none">
          <MagicDown value={result.summary || result.synthesis} onChange={() => {}} />
        </div>
      </div>

      {/* Knowledge Sources - Show if knowledge enhancement was used */}
      {result.sources && result.sources.length > 0 && (
        <div className="p-4 border rounded-md bg-blue-50 dark:bg-blue-900/10">
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <span className="text-blue-600 dark:text-blue-400">🔍</span>
            {t("deepThink.results.knowledgeSources")}
            <span className="text-sm font-normal text-gray-500">
              ({result.sources.length})
            </span>
          </h3>
          <div className="space-y-2">
            {result.sources.map((source, idx) => (
              <div
                key={idx}
                className="p-3 bg-white dark:bg-gray-800 rounded border border-blue-200 dark:border-blue-800"
              >
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 dark:text-blue-400 hover:underline block mb-1"
                >
                  [{idx + 1}] {source.title || source.url}
                </a>
                {source.content && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {source.content}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agent Results */}
      <div className="border rounded-md p-4">
        <h3 className="font-semibold text-lg mb-3">
          {t("deepThink.results.agentSolutions")}
        </h3>
        <Accordion type="single" collapsible className="w-full">
          {result.agentResults.map((agent) => (
            <AccordionItem key={agent.agentId} value={agent.agentId}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{agent.agentId}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {agent.approach}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {agent.status === "completed" ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-2">
                  {agent.error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm">
                      <p className="font-medium text-red-700 dark:text-red-400 mb-1">
                        {t("deepThink.results.error")}
                      </p>
                      <p className="text-red-600 dark:text-red-300">{agent.error}</p>
                    </div>
                  )}
                  {agent.solution && (
                    <div className="prose dark:prose-invert max-w-none">
                      <MagicDown value={agent.solution} onChange={() => {}} />
                    </div>
                  )}
                  {agent.verifications && agent.verifications.length > 0 && (
                    <details className="text-sm">
                      <summary className="cursor-pointer text-gray-600 dark:text-gray-400">
                        {t("deepThink.results.viewVerifications")} (
                        {agent.verifications.length})
                      </summary>
                      <div className="mt-2 space-y-2">
                        {agent.verifications.map((v, vIdx) => (
                          <div
                            key={vIdx}
                            className={cn(
                              "p-2 rounded border",
                              v.passed
                                ? "bg-green-50 dark:bg-green-900/10 border-green-200"
                                : "bg-red-50 dark:bg-red-900/10 border-red-200"
                            )}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              {v.passed ? (
                                <CheckCircle2 className="w-3 h-3 text-green-500" />
                              ) : (
                                <XCircle className="w-3 h-3 text-red-500" />
                              )}
                              <span className="text-xs">
                                {new Date(v.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            {v.bugReport && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {v.bugReport}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Original Plan */}
      {result.plan && (
        <details className="border rounded-md p-4">
          <summary className="font-semibold cursor-pointer">
            {t("deepThink.results.originalPlan")}
          </summary>
          <div className="prose dark:prose-invert max-w-none mt-3">
            <MagicDown value={result.plan} onChange={() => {}} />
          </div>
        </details>
      )}
    </div>
  );
}

