"use client";
import { Project } from "@/app/api/projects/route";
import { createContext, useContext } from "react";

export interface CurrentPageType {
  path: string;
  contents: string;
}

export interface ChatMessage {
  role: "user" | "model";
  message: string;
}

interface AgentContextInterface {
  agentHistory: ChatMessage[];
  setAgentHistory: (newHistory: ChatMessage[]) => void;
  currentPageRef: React.RefObject<CurrentPageType>;
  goToRandomProject: () => void;
}

export const AgentContext = createContext<AgentContextInterface | null>(null);

export const useAgentContext = () => {
  const context = useContext(AgentContext);
  return context;
};
