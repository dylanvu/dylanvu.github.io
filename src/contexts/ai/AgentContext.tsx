'use client'
import { createContext, useContext } from "react";

export interface CurrentPageType {
    path: string,
    contents: string,
}

interface AgentContextInterface {
    /**
     * chat history of the agent
     */
    agentContext: string[]

    /**
     * function to modify agent context history
     * @param value new context history
     * @returns 
     */
    setAgentContext: (value: string[]) => void;

    /**
     * contents of the current page the user is on
     */
    currentPage: CurrentPageType;

    /**
     * function to modify the agent's knowledge of the contents of the current page
     * @param value new page contents
     * @returns 
     */
    setCurrentPageContent: (value: CurrentPageType) => void;
}

export const AgentContext = createContext<AgentContextInterface | null>(null);

export const useAgentContext = () => {
    const context = useContext(AgentContext);
    if (!context) {
        throw new Error("useAgentContext must be used within an AgentProvider");
    }
    return context
}