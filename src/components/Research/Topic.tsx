"use client";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  LoaderCircle,
  SquarePlus,
  FilePlus,
  BookText,
  Paperclip,
  Link,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import ResourceList from "@/components/Knowledge/ResourceList";
import Crawler from "@/components/Knowledge/Crawler";
import ModeSelector from "@/components/DeepThink/ModeSelector";
import { Button } from "@/components/Internal/Button";
import MagicDown from "@/components/MagicDown";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useDeepThinkEngine from "@/hooks/useDeepThink";
import useModelProvider from "@/hooks/useAiProvider";
import useKnowledge from "@/hooks/useKnowledge";
import useAccurateTimer from "@/hooks/useAccurateTimer";
import { useGlobalStore } from "@/store/global";
import { useSettingStore } from "@/store/setting";
import { useTaskStore } from "@/store/task";
import { useHistoryStore } from "@/store/history";
import { useKnowledgeStore } from "@/store/knowledge";

const formSchema = z.object({
  topic: z.string().min(2),
});

function Topic() {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const taskStore = useTaskStore();
  const globalStore = useGlobalStore();
  const { 
    runDeepThinkMode, 
    runUltraThinkMode,
    interactiveState,
    startInteractiveDeepThink,
    continueWithAnswers,
    resetInteractiveState
  } = useDeepThinkEngine();
  const { hasApiKey } = useModelProvider();
  const { getKnowledgeFromFile } = useKnowledge();
  const {
    formattedTime,
    start: accurateTimerStart,
    stop: accurateTimerStop,
  } = useAccurateTimer();
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [openCrawler, setOpenCrawler] = useState<boolean>(false);
  const [numAgents, setNumAgents] = useState<number>(0); // 0 = auto mode
  const [userAnswers, setUserAnswers] = useState<string>(""); // 用户回答

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: taskStore.question,
    },
  });

  function handleCheck(): boolean {
    const { mode } = useSettingStore.getState();
    if ((mode === "local" && hasApiKey()) || mode === "proxy") {
      return true;
    } else {
      const { setOpenSetting } = useGlobalStore.getState();
      setOpenSetting(true);
      return false;
    }
  }

  // 收集知识库资源并生成上下文
  function collectKnowledgeContext(): string {
    const { resources } = useTaskStore.getState();
    const { get: getKnowledge } = useKnowledgeStore.getState();
    
    if (resources.length === 0) {
      return "";
    }

    const knowledgeTexts: string[] = [];
    
    for (const item of resources) {
      if (item.status === "completed") {
        const knowledge = getKnowledge(item.id);
        if (knowledge && knowledge.content) {
          knowledgeTexts.push(
            `### ${knowledge.title || item.name} ###\n\n${knowledge.content}`
          );
        }
      }
    }

    if (knowledgeTexts.length === 0) {
      return "";
    }

    return knowledgeTexts.join("\n\n---\n\n");
  }

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    if (handleCheck()) {
      const { id, setQuestion } = useTaskStore.getState();
      const {
        thinkMode,
        setDeepThinkResult,
        setUltraThinkResult,
        setIsThinking: setGlobalThinking,
      } = useGlobalStore.getState();
      const { enableAskQuestions } = useSettingStore.getState();
      
      try {
        setIsThinking(true);
        setGlobalThinking(true);
        accurateTimerStart();
        if (id !== "") {
          createNewResearch();
          form.setValue("topic", values.topic);
        }
        setQuestion(values.topic);

        // 收集知识库资源
        const knowledgeContext = collectKnowledgeContext();

        // 检查是否启用问问题功能（仅对Deep Think模式）
        if (thinkMode === "deep-think" && enableAskQuestions === "enable") {
          // 使用交互式Deep Think流程
          const result = await startInteractiveDeepThink(values.topic, [], knowledgeContext);
          if (result && result.questions) {
            // 问题已生成，暂停计时器等待用户回答
            setIsThinking(false);
            setGlobalThinking(false);
            accurateTimerStop();
          }
          return; // 提前返回，等待用户回答
        }

        // 标准非交互流程
        // Route to different modes
        if (thinkMode === "deep-think") {
          const result = await runDeepThinkMode(values.topic, [], knowledgeContext);
          if (result) {
            setDeepThinkResult(result);
            // 保存到历史记录
            const { saveThink } = useHistoryStore.getState();
            saveThink("deep-think", values.topic, result);
          }
        } else if (thinkMode === "ultra-think") {
          // Pass undefined if numAgents is 0 (auto mode)
          const result = await runUltraThinkMode(
            values.topic, 
            numAgents === 0 ? undefined : numAgents, 
            [], 
            knowledgeContext
          );
          if (result) {
            setUltraThinkResult(result);
            // 保存到历史记录
            const { saveThink } = useHistoryStore.getState();
            saveThink("ultra-think", values.topic, result);
          }
        }
      } finally {
        // 只有在非交互模式或完成后才重置状态
        if (!(thinkMode === "deep-think" && enableAskQuestions === "enable") || !interactiveState.isWaitingForAnswers) {
          setIsThinking(false);
          setGlobalThinking(false);
          accurateTimerStop();
        }
      }
    }
  }

  // 处理用户回答并继续Deep Think
  async function handleAnswersSubmit(answers: string) {
    const {
      setDeepThinkResult,
      setIsThinking: setGlobalThinking,
    } = useGlobalStore.getState();
    
    try {
      // 重新启动计时器和思考状态
      setIsThinking(true);
      setGlobalThinking(true);
      accurateTimerStart(); // 重新启动计时器！
      
      // 继续执行Deep Think
      const result = await continueWithAnswers(answers);
      if (result) {
        setDeepThinkResult(result);
        // 保存到历史记录
        const { saveThink } = useHistoryStore.getState();
        const { question } = useTaskStore.getState();
        saveThink("deep-think", question, result);
        // 成功后重置答案
        setUserAnswers("");
      }
    } catch (error) {
      console.error("继续思考时出错:", error);
      toast.error("继续思考时出现错误，请重试");
    } finally {
      setIsThinking(false);
      setGlobalThinking(false);
      accurateTimerStop();
    }
  }

  function createNewResearch() {
    const { id, backup, reset } = useTaskStore.getState();
    const { update } = useHistoryStore.getState();
    const { resetThinkResults } = useGlobalStore.getState();
    if (id) update(id, backup());
    reset();
    resetThinkResults();
    resetInteractiveState(); // 重置交互状态
    setUserAnswers(""); // 重置用户答案
    setIsThinking(false); // 重置思考状态
    accurateTimerStop(); // 停止计时器
    form.reset();
  }

  function openKnowledgeList() {
    const { setOpenKnowledge } = useGlobalStore.getState();
    setOpenKnowledge(true);
  }

  async function handleFileUpload(files: FileList | null) {
    if (files) {
      for await (const file of files) {
        await getKnowledgeFromFile(file);
      }
      // Clear the input file to avoid processing the previous file multiple times
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  useEffect(() => {
    form.setValue("topic", taskStore.question);
  }, [taskStore.question, form]);

  return (
    <section className="p-4 border rounded-md mt-4 print:hidden">
      <div className="flex justify-between items-center border-b mb-2">
        <h3 className="font-semibold text-lg leading-10">
          {t("research.topic.title")}
        </h3>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => createNewResearch()}
            title={t("research.common.newResearch")}
          >
            <SquarePlus />
          </Button>
        </div>
      </div>
      {/* 问问题交互界面 - 在同一页面内显示 */}
      {interactiveState.isWaitingForAnswers && interactiveState.questions ? (
        <div className="space-y-4">
          {/* 显示生成的问题 */}
          <div className="p-4 border rounded-md bg-purple-50 dark:bg-purple-900/10">
            <h4 className="font-semibold text-lg mb-3 text-purple-700 dark:text-purple-400">
              💭 {t("deepThink.questions.title")}
            </h4>
            <p className="text-sm text-purple-600 dark:text-purple-300 mb-3">
              {t("deepThink.questions.description")}
            </p>
            <div className="prose dark:prose-invert max-w-none text-sm bg-white dark:bg-gray-900 p-3 rounded">
              <MagicDown value={interactiveState.questions} onChange={() => {}} hideTools />
            </div>
          </div>

          {/* 用户回答输入区 */}
          <div className="p-4 border rounded-md">
            <h4 className="font-semibold text-base mb-2">
              ✍️ {t("deepThink.questions.yourAnswers")}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {t("deepThink.questions.answerPrompt")}
            </p>
            <Textarea
              value={userAnswers}
              onChange={(e) => setUserAnswers(e.target.value)}
              placeholder={t("deepThink.questions.placeholder")}
              className="min-h-[120px] mb-3"
              disabled={isThinking}
            />
            
            {/* 帮助提示 */}
            <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg mb-3">
              <p className="font-medium mb-1">{t("deepThink.questions.tips.title")}</p>
              <ul className="list-disc list-inside space-y-1 ml-2 text-xs">
                <li>{t("deepThink.questions.tips.specific")}</li>
                <li>{t("deepThink.questions.tips.context")}</li>
                <li>{t("deepThink.questions.tips.constraints")}</li>
                <li>{t("deepThink.questions.tips.skip")}</li>
              </ul>
            </div>

            <Button
              className="w-full"
              onClick={() => {
                if (userAnswers.trim() || window.confirm("确定跳过所有问题直接继续？")) {
                  handleAnswersSubmit(userAnswers);
                }
              }}
              disabled={isThinking}
            >
              {isThinking ? (
                <>
                  <LoaderCircle className="animate-spin" />
                  <span>{t("deepThink.status.thinking", { iteration: 0, phase: "thinking" })}</span>
                  <small className="font-mono ml-2">{formattedTime}</small>
                </>
              ) : (
                <>
                  {t("deepThink.questions.continue")}
                  <span className="ml-2">→</span>
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            {/* Mode Selector */}
            <ModeSelector
              value={globalStore.thinkMode}
              onChange={(mode) => {
                globalStore.setThinkMode(mode);
                globalStore.resetThinkResults();
              }}
              className="mb-4"
            />

            {/* Ultra Think Config */}
            {globalStore.thinkMode === "ultra-think" && (
              <FormItem className="mb-4">
                <FormLabel>{t("deepThink.config.numAgents")}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    max={10}
                    value={numAgents}
                    onChange={(e) => setNumAgents(parseInt(e.target.value))}
                  />
                </FormControl>
                <p className="text-xs text-gray-500 mt-1">
                  {t("deepThink.config.numAgentsTip")} (0 = Auto)
                </p>
              </FormItem>
            )}

            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="mb-2 text-base font-semibold">
                    {t("research.topic.topicLabel")}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder={t("research.topic.topicPlaceholder")}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormItem className="mt-2">
              <FormLabel className="mb-2 text-base font-semibold">
                {t("knowledge.localResourceTitle")}
              </FormLabel>
              <FormControl onSubmit={(ev) => ev.stopPropagation()}>
                <div>
                  {taskStore.resources.length > 0 ? (
                    <ResourceList
                      className="pb-2 mb-2 border-b"
                      resources={taskStore.resources}
                      onRemove={taskStore.removeResource}
                    />
                  ) : null}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div className="inline-flex border p-2 rounded-md text-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
                        <FilePlus className="w-5 h-5" />
                        <span className="ml-1">{t("knowledge.addResource")}</span>
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => openKnowledgeList()}>
                        <BookText />
                        <span>{t("knowledge.knowledge")}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleCheck() && fileInputRef.current?.click()
                        }
                      >
                        <Paperclip />
                        <span>{t("knowledge.localFile")}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleCheck() && setOpenCrawler(true)}
                      >
                        <Link />
                        <span>{t("knowledge.webPage")}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </FormControl>
            </FormItem>
            <Button className="w-full mt-4" disabled={isThinking} type="submit">
              {isThinking ? (
                <>
                  <LoaderCircle className="animate-spin" />
                  <span>{t("deepThink.status.thinking", { iteration: 0, phase: "initializing" })}</span>
                  <small className="font-mono">{formattedTime}</small>
                </>
              ) : (
                t("research.common.startThinking")
              )}
            </Button>
          </form>
        </Form>
      )}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        hidden
        onChange={(ev) => handleFileUpload(ev.target.files)}
      />
      <Crawler
        open={openCrawler}
        onClose={() => setOpenCrawler(false)}
      />
    </section>
  );
}

export default Topic;
