"use client";
import { useTranslation } from "react-i18next";
import { Brain, Network } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModeSelectorProps {
  value: ThinkMode;
  onChange: (mode: ThinkMode) => void;
  className?: string;
}

export default function ModeSelector({
  value,
  onChange,
  className,
}: ModeSelectorProps) {
  const { t } = useTranslation();

  const modes: Array<{
    value: ThinkMode;
    label: string;
    icon: React.ReactNode;
    description: string;
  }> = [
    {
      value: "deep-think",
      label: t("deepThink.mode.deepThink.title"),
      icon: <Brain className="w-5 h-5" />,
      description: t("deepThink.mode.deepThink.description"),
    },
    {
      value: "ultra-think",
      label: t("deepThink.mode.ultraThink.title"),
      icon: <Network className="w-5 h-5" />,
      description: t("deepThink.mode.ultraThink.description"),
    },
  ];

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label className="text-sm font-semibold">
        {t("deepThink.mode.label")}
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {modes.map((mode) => (
          <button
            type="button"
            key={mode.value}
            onClick={() => onChange(mode.value)}
            className={cn(
              "flex flex-col items-start p-3 border rounded-md transition-all hover:shadow-md",
              value === mode.value
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-gray-200 dark:border-gray-700"
            )}
          >
            <div className="flex items-center gap-2 mb-1">
              {mode.icon}
              <span className="font-medium">{mode.label}</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 text-left">
              {mode.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

