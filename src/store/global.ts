import { create } from "zustand";

interface GlobalStore {
  openSetting: boolean;
  openHistory: boolean;
  openKnowledge: boolean;
  thinkMode: ThinkMode;
  deepThinkResult: DeepThinkResult | null;
  ultraThinkResult: UltraThinkResult | null;
  isThinking: boolean;
  currentIteration: number;
  currentPhase: string;
  currentSolution: string;
  agentResults: AgentResult[];
}

interface GlobalActions {
  setOpenSetting: (visible: boolean) => void;
  setOpenHistory: (visible: boolean) => void;
  setOpenKnowledge: (visible: boolean) => void;
  setThinkMode: (mode: ThinkMode) => void;
  setDeepThinkResult: (result: DeepThinkResult | null) => void;
  setUltraThinkResult: (result: UltraThinkResult | null) => void;
  setIsThinking: (thinking: boolean) => void;
  setCurrentIteration: (iteration: number) => void;
  setCurrentPhase: (phase: string) => void;
  setCurrentSolution: (solution: string) => void;
  setAgentResults: (agents: AgentResult[]) => void;
  updateAgentResult: (agentId: string, update: Partial<AgentResult>) => void;
  resetThinkResults: () => void;
}

export const useGlobalStore = create<GlobalStore & GlobalActions>((set) => ({
  openSetting: false,
  openHistory: false,
  openKnowledge: false,
  thinkMode: "deep-think",
  deepThinkResult: null,
  ultraThinkResult: null,
  isThinking: false,
  currentIteration: 0,
  currentPhase: "",
  currentSolution: "",
  agentResults: [],
  setOpenSetting: (visible) => set({ openSetting: visible }),
  setOpenHistory: (visible) => set({ openHistory: visible }),
  setOpenKnowledge: (visible) => set({ openKnowledge: visible }),
  setThinkMode: (mode) => set({ thinkMode: mode }),
  setDeepThinkResult: (result) => set({ deepThinkResult: result }),
  setUltraThinkResult: (result) => set({ ultraThinkResult: result }),
  setIsThinking: (thinking) => set({ isThinking: thinking }),
  setCurrentIteration: (iteration) => set({ currentIteration: iteration }),
  setCurrentPhase: (phase) => set({ currentPhase: phase }),
  setCurrentSolution: (solution) => set({ currentSolution: solution }),
  setAgentResults: (agents) => set({ agentResults: agents }),
  updateAgentResult: (agentId, update) =>
    set((state) => ({
      agentResults: state.agentResults.map((agent) =>
        agent.agentId === agentId ? { ...agent, ...update } : agent
      ),
    })),
  resetThinkResults: () =>
    set({
      deepThinkResult: null,
      ultraThinkResult: null,
      isThinking: false,
      currentIteration: 0,
      currentPhase: "",
      currentSolution: "",
      agentResults: [],
    }),
}));
