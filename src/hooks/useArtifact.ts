import { useState } from "react";
import { streamText, smoothStream } from "ai";
import { toast } from "sonner";
import { useSettingStore } from "@/store/setting";
import useModelProvider from "@/hooks/useAiProvider";
import {
  AIWritePrompt,
  changeLanguagePrompt,
  changeReadingLevelPrompt,
  adjustLengthPrompt,
  continuationPrompt,
  addEmojisPrompt,
} from "@/utils/artifact";
import { parseError } from "@/utils/error";

type ArtifactProps = {
  value: string;
  onChange: (value: string) => void;
};

function smoothTextStream(type: "character" | "word" | "line") {
  return smoothStream({
    chunking: type === "character" ? /./ : type,
    delayInMs: 0,
  });
}

function handleError(error: unknown) {
  const errorMessage = parseError(error);
  toast.error(errorMessage);
}

function useArtifact({ value, onChange }: ArtifactProps) {
  const { smoothTextStreamType } = useSettingStore();
  const { createModelProvider, getModel } = useModelProvider();
  const [loadingAction, setLoadingAction] = useState<string>("");

  async function AIWrite(prompt: string, systemInstruction?: string) {
    const { model } = getModel();
    setLoadingAction("aiWrite");
    const result = streamText({
      model: await createModelProvider(model),
      prompt: AIWritePrompt(value, prompt, systemInstruction),
      experimental_transform: smoothTextStream(smoothTextStreamType),
      onError: handleError,
    });
    let text = "";
    for await (const textPart of result.textStream) {
      text += textPart;
      onChange(text);
    }
    text = "";
    setLoadingAction("");
  }

  async function translate(lang: string, systemInstruction?: string) {
    const { model } = getModel();
    setLoadingAction("translate");
    const result = streamText({
      model: await createModelProvider(model),
      prompt: changeLanguagePrompt(value, lang, systemInstruction),
      experimental_transform: smoothTextStream(smoothTextStreamType),
      onError: handleError,
    });
    let text = "";
    for await (const textPart of result.textStream) {
      text += textPart;
      onChange(text);
    }
    text = "";
    setLoadingAction("");
  }

  async function changeReadingLevel(level: string, systemInstruction?: string) {
    const { model } = getModel();
    setLoadingAction("readingLevel");
    const result = streamText({
      model: await createModelProvider(model),
      prompt: changeReadingLevelPrompt(value, level, systemInstruction),
      experimental_transform: smoothTextStream(smoothTextStreamType),
      onError: handleError,
    });
    let text = "";
    for await (const textPart of result.textStream) {
      text += textPart;
      onChange(text);
    }
    text = "";
    setLoadingAction("");
  }

  async function adjustLength(length: string, systemInstruction?: string) {
    const { model } = getModel();
    setLoadingAction("adjustLength");
    const result = streamText({
      model: await createModelProvider(model),
      prompt: adjustLengthPrompt(value, length, systemInstruction),
      experimental_transform: smoothTextStream(smoothTextStreamType),
      onError: handleError,
    });
    let text = "";
    for await (const textPart of result.textStream) {
      text += textPart;
      onChange(text);
    }
    text = "";
    setLoadingAction("");
  }

  async function continuation(systemInstruction?: string) {
    const { model } = getModel();
    setLoadingAction("continuation");
    const result = streamText({
      model: await createModelProvider(model),
      prompt: continuationPrompt(value, systemInstruction),
      experimental_transform: smoothTextStream(smoothTextStreamType),
      onError: handleError,
    });
    let text = value + "\n";
    for await (const textPart of result.textStream) {
      text += textPart;
      onChange(text);
    }
    text = "";
    setLoadingAction("");
  }

  async function addEmojis(systemInstruction?: string) {
    const { model } = getModel();
    setLoadingAction("addEmojis");
    const result = streamText({
      model: await createModelProvider(model),
      prompt: addEmojisPrompt(value, systemInstruction),
      experimental_transform: smoothTextStream(smoothTextStreamType),
      onError: handleError,
    });
    let text = "";
    for await (const textPart of result.textStream) {
      text += textPart;
      onChange(text);
    }
    text = "";
    setLoadingAction("");
  }

  return {
    loadingAction,
    AIWrite,
    translate,
    changeReadingLevel,
    adjustLength,
    continuation,
    addEmojis,
  };
}

export default useArtifact;
