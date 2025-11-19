"use client";

import { createContext, useContext, useState } from "react";
import { ChatMessage, talkToAgent } from "@/hooks/Polaris/tools/talk";

interface PolarisContextInterface {
  polarisHistory: ChatMessage[];
  setPolarisHistory: (newHistory: ChatMessage[]) => void;
  talkToPolaris: (newMessage: string) => void;
  isThinking: boolean;
}

const PolarisContext = createContext<PolarisContextInterface | undefined>(
  undefined
);

export function PolarisProvider({ children }: { children: React.ReactNode }) {
  const initialMessage: ChatMessage = {
    role: "model",
    message:
      "Good evening, stargazer. What would you like to know about Dylan's night sky?",
  };

  const [polarisHistory, setPolarisHistory] = useState<ChatMessage[]>([
    initialMessage,
    {
      role: "user",
      message: "What is the name of the star in the center of the night sky?",
    },
  ]);

  const [isThinking, setIsThinking] = useState<boolean>(false);

  async function talkToPolaris(newMessage: string) {
    await talkToAgent(
      newMessage,
      polarisHistory,
      setPolarisHistory,
      setIsThinking
    );
  }

  return (
    <PolarisContext.Provider
      value={{ isThinking, polarisHistory, setPolarisHistory, talkToPolaris }}
    >
      {children}
    </PolarisContext.Provider>
  );
}

export function usePolarisContext() {
  const ctx = useContext(PolarisContext);
  if (!ctx) {
    throw new Error("usePolarisContext must be used within PolarisProvider");
  }
  return ctx;
}
