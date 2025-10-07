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
import ResourceList from "@/components/Knowledge/ResourceList";
import Crawler from "@/components/Knowledge/Crawler";
import ModeSelector from "@/components/DeepThink/ModeSelector";
import { Button } from "@/components/Internal/Button";
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
import useAiProvider from "@/hooks/useAiProvider";
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
  const { runDeepThinkMode, runUltraThinkMode } = useDeepThinkEngine();
  const { hasApiKey } = useAiProvider();
  const { getKnowledgeFromFile } = useKnowledge();
  const {
    formattedTime,
    start: accurateTimerStart,
    stop: accurateTimerStop,
  } = useAccurateTimer();
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [openCrawler, setOpenCrawler] = useState<boolean>(false);
  const [numAgents, setNumAgents] = useState<number>(0); // 0 = auto mode

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
        setIsThinking(false);
        setGlobalThinking(false);
        accurateTimerStop();
      }
    }
  }

  function createNewResearch() {
    const { id, backup, reset } = useTaskStore.getState();
    const { update } = useHistoryStore.getState();
    const { resetThinkResults } = useGlobalStore.getState();
    if (id) update(id, backup());
    reset();
    resetThinkResults();
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
