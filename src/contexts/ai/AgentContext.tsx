'use client'
import { createContext, useContext } from "react";

export const AgentContext = createContext(null);

export const useAgentContext = () => useContext(AgentContext);