import { create } from "zustand";
import { persist, type StorageValue } from "zustand/middleware";
import type { TaskStore } from "./task";
import { researchStore } from "@/utils/storage";
import { customAlphabet } from "nanoid";
import { clone, pick } from "radash";

// 通用历史记录，支持所有模式
export interface ResearchHistory extends TaskStore {
  createdAt: number;
  updatedAt?: number;
}

export interface ThinkHistory {
  id: string;
  mode: "deep-think" | "ultra-think";
  question: string;
  result: DeepThinkResult | UltraThinkResult;
  createdAt: number;
  updatedAt?: number;
}

export type HistoryItem = ResearchHistory | ThinkHistory;

export interface HistoryStore {
  history: HistoryItem[];
}

interface HistoryActions {
  save: (taskStore: TaskStore) => string;
  saveThink: (
    mode: "deep-think" | "ultra-think",
    question: string,
    result: DeepThinkResult | UltraThinkResult
  ) => string;
  load: (id: string) => HistoryItem | void;
  update: (id: string, taskStore: TaskStore) => boolean;
  remove: (id: string) => boolean;
}

const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 12);

export const useHistoryStore = create(
  persist<HistoryStore & HistoryActions>(
    (set, get) => ({
      history: [],
      save: (taskStore) => {
        // Only tasks with a title and final report are saved to the history
        if (taskStore.title && taskStore.finalReport) {
          const id = nanoid();
          const newHistory: ResearchHistory = {
            ...clone(taskStore),
            id,
            createdAt: Date.now(),
          };
          set((state) => ({ history: [newHistory, ...state.history] }));
          return id;
        }
        return "";
      },
      saveThink: (mode, question, result) => {
        if (question && result) {
          const id = nanoid();
          const newHistory: ThinkHistory = {
            id,
            mode,
            question,
            result: clone(result),
            createdAt: Date.now(),
          };
          set((state) => ({ history: [newHistory, ...state.history] }));
          return id;
        }
        return "";
      },
      load: (id) => {
        const current = get().history.find((item) => item.id === id);
        if (current) return clone(current);
      },
      update: (id, taskStore) => {
        const newHistory = get().history.map((item) => {
          if (item.id === id) {
            return {
              ...clone(taskStore),
              updatedAt: Date.now(),
            } as ResearchHistory;
          } else {
            return item;
          }
        });
        set(() => ({ history: [...newHistory] }));
        return true;
      },
      remove: (id) => {
        set((state) => ({
          history: state.history.filter((item) => item.id !== id),
        }));
        return true;
      },
    }),
    {
      name: "historyStore",
      version: 1,
      storage: {
        getItem: async (key: string) => {
          return await researchStore.getItem<
            StorageValue<HistoryStore & HistoryActions>
          >(key);
        },
        setItem: async (
          key: string,
          store: StorageValue<HistoryStore & HistoryActions>
        ) => {
          return await researchStore.setItem(key, {
            state: pick(store.state, ["history"]),
            version: store.version,
          });
        },
        removeItem: async (key: string) => await researchStore.removeItem(key),
      },
    }
  )
);
