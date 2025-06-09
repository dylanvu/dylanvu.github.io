'use client'
import { createContext, useContext } from "react";

export interface CurrentPageType {
    path: string,
    contents: string,
}

export interface ChatMessage {
    role: "user" | "model",
    message: string
}

interface AgentContextInterface {
    agentHistory: ChatMessage[];
    setAgentHistory: (newHistory: ChatMessage[]) => void;
    currentPageRef: React.RefObject<CurrentPageType>;
}

export const AgentContext = createContext<AgentContextInterface | null>(null);

export const useAgentContext = () => {
    const context = useContext(AgentContext);
    return context
}