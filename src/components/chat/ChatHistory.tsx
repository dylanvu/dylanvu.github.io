"use client";

import { ChatMessage, useAgentContext } from "@/contexts/ai/AgentContext";
import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import "@/styles/chat/chat.css";

// TODO: Add prebuilt options:
// "can't decide = triggers the random button",
// "give me a tour = triggers the general tour flow"

export default function ChatHistory() {
  const agentContext = useAgentContext();
  const chatHistoryRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // scroll to bottom if agent history changes
    if (chatHistoryRef.current) {
      chatHistoryRef.current.style.scrollBehavior = "smooth";
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [agentContext?.agentHistory]);

  function submitQuery(query: string) {
    const newUserMessage: ChatMessage = {
      role: "user",
      message: query,
    };

    if (agentContext?.agentHistory) {
      agentContext?.setAgentHistory([
        ...agentContext?.agentHistory,
        newUserMessage,
      ]);
    }
  }

  return (
    <div className="chat-history-contents" ref={chatHistoryRef}>
      <div className="chat-history-messages">
        <AnimatePresence>
          {agentContext?.agentHistory.map((message, index) => {
            const messageType =
              message.role === "model" ? "model-message" : "user-message";
            return (
              <motion.div
                key={`${"chat-message-" + index}`}
                className={`chat-message interactable-element-border ${messageType}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ ease: "easeInOut", duration: 0.2 }}
              >
                {message.message}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      <div className="chat-history-presets">
        {/* <button onClick={() => submitQuery("Surprise me!")}>Surprise me</button> */}
        <button
          onClick={() => {
            agentContext?.goToRandomProject();
          }}
        >
          Surprise me
        </button>
        <button onClick={() => submitQuery("Give me the full tour.")}>
          The full tour
        </button>
      </div>
    </div>
  );
}
