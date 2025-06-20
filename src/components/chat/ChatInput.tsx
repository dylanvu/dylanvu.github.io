"use client";

import React, { useState } from "react";
import "@/styles/chat/chat.css";
import { useAgentContext } from "@/contexts/ai/AgentContext";

export default function ChatInput() {
  const [query, setQuery] = useState<string>("");
  const agentContext = useAgentContext();

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setQuery(e.target.value);
  }

  function handleKeydown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // prevent newline
      submitQuery();
    }
  }

  function submitQuery() {
    agentContext?.talkToAgent(query);
    // clear the input area
    setQuery("");
  }

  return (
    <textarea
      className={`interactable-element-border chat-input ${agentContext?.isThinking ? "chat-input-disabled" : "chat-input-enabled"}`}
      placeholder={
        !agentContext?.isThinking ? "What do you want to see?" : "Thinking..."
      }
      value={query}
      onChange={handleInput}
      onKeyDown={handleKeydown}
      disabled={agentContext?.isThinking}
    />
  );
}
