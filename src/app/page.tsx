"use client";
import dynamic from "next/dynamic";
import { useLayoutEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { useGlobalStore } from "@/store/global";
import { useSettingStore } from "@/store/setting";

const Header = dynamic(() => import("@/components/Internal/Header"));
const Setting = dynamic(() => import("@/components/Setting"));
const Topic = dynamic(() => import("@/components/Research/Topic"));
const History = dynamic(() => import("@/components/History"));
const Knowledge = dynamic(() => import("@/components/Knowledge"));
const ThinkingProcess = dynamic(
  () => import("@/components/DeepThink/ThinkingProcess")
);
const AgentProgress = dynamic(
  () => import("@/components/DeepThink/AgentProgress")
);
const DeepThinkResults = dynamic(
  () =>
    import("@/components/DeepThink/Results").then((mod) => ({
      default: mod.DeepThinkResults,
    }))
);
const UltraThinkResults = dynamic(
  () =>
    import("@/components/DeepThink/Results").then((mod) => ({
      default: mod.UltraThinkResults,
    }))
);

function Home() {
  const { t } = useTranslation();
  const {
    openSetting,
    setOpenSetting,
    openHistory,
    setOpenHistory,
    openKnowledge,
    setOpenKnowledge,
    thinkMode,
    deepThinkResult,
    ultraThinkResult,
    isThinking,
    currentIteration,
    currentPhase,
    currentSolution,
    agentResults,
  } = useGlobalStore();

  const { theme } = useSettingStore();
  const { setTheme } = useTheme();

  useLayoutEffect(() => {
    const settingStore = useSettingStore.getState();
    setTheme(settingStore.theme);
  }, [theme, setTheme]);
  return (
    <div className="max-lg:max-w-screen-md max-w-screen-lg mx-auto px-4">
      <Header />
      <main>
        <Topic />
        
        {/* Deep Think Mode - Show thinking process (only when actually thinking) */}
        {thinkMode === "deep-think" && isThinking && !deepThinkResult && (
          <>
            <section className="p-4 border rounded-md mt-4">
              <ThinkingProcess
                steps={[
                  {
                    id: "thinking",
                    label: t("deepThink.status.thinking", {
                      iteration: currentIteration,
                      phase: currentPhase || "initializing",
                    }),
                    status: "running",
                    detail: currentIteration > 0 ? `第 ${currentIteration} 轮 - ${currentPhase}` : undefined,
                  },
                ]}
              />
            </section>
            {/* Show current solution if available */}
            {currentSolution && (
              <section className="p-4 border rounded-md mt-4">
                <h3 className="font-semibold text-lg mb-3">
                  {t("deepThink.results.currentSolution")} (第 {currentIteration} 轮)
                </h3>
                <div className="prose dark:prose-invert max-w-none text-sm">
                  <pre className="whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-3 rounded">
                    {currentSolution}
                  </pre>
                </div>
              </section>
            )}
          </>
        )}
        
        {/* Ultra Think Mode - Show agent progress (only when actually thinking) */}
        {thinkMode === "ultra-think" && isThinking && !ultraThinkResult && (
          <section className="p-4 border rounded-md mt-4">
            <AgentProgress agents={agentResults} />
          </section>
        )}

        {/* Results Display */}
        {thinkMode === "deep-think" && deepThinkResult && (
          <section className="p-4 border rounded-md mt-4">
            <DeepThinkResults result={deepThinkResult} />
          </section>
        )}
        {thinkMode === "ultra-think" && ultraThinkResult && (
          <section className="p-4 border rounded-md mt-4">
            <UltraThinkResults result={ultraThinkResult} />
          </section>
        )}
      </main>
      <footer className="my-4 text-center text-sm text-gray-600 print:hidden">
        <a href="https://github.com/u14app/" target="_blank">
          {t("copyright", {
            name: "U14App",
          })}
        </a>
      </footer>
      <aside className="print:hidden">
        <Setting open={openSetting} onClose={() => setOpenSetting(false)} />
        <History open={openHistory} onClose={() => setOpenHistory(false)} />
        <Knowledge
          open={openKnowledge}
          onClose={() => setOpenKnowledge(false)}
        />
      </aside>
    </div>
  );
}

export default Home;
