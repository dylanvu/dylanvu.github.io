'use client'
import { createContext, useContext } from "react";

export interface CurrentPageType {
    path: string,
    contents: string,
}

interface AgentContextInterface {
    agentHistoryRef: React.RefObject<string[]>;
    currentPageRef: React.RefObject<CurrentPageType>;
}

export const AgentContext = createContext<AgentContextInterface | null>(null);

export const useAgentContext = () => {
    const context = useContext(AgentContext);
    return context
}