"use client";

import { useAgentContext } from "@/contexts/ai/AgentContext";
import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import "@/styles/chat/chat.css";
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";

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

  return (
    <div className="chat-history-contents" ref={chatHistoryRef}>
      <div className="chat-history-messages">
        <AnimatePresence>
          {agentContext?.agentHistory.map((message, index) => {
            const messageType =
              message.role === "model" ? "model-message" : "user-message";
            return (
              // TODO: need to figure out how to render the LLM's response better. It has lists (unordered), and bold text.
              <motion.div
                key={`${"chat-message-" + index}`}
                className={`chat-message interactable-element-border ${messageType}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ ease: "easeInOut", duration: 0.2 }}
              >
                {/* // handle the LLM's response with special rendering*/}
                {message.role === "model" ? (
                  <div className="chat-message-response">
                    <ReactMarkdown remarkPlugins={[gfm]}>
                      {message.message}
                    </ReactMarkdown>
                  </div>
                ) : (
                  message.message
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {agentContext?.isThinking ? (
          <motion.div
            key="thinking-chat-history-presets"
            animate={{ opacity: 1 }}
          >
            Thinking...
          </motion.div>
        ) : (
          <motion.div
            className="chat-history-presets"
            key="chat-history-presets"
            animate={{ opacity: 1 }}
          >
            <button
              onClick={() => {
                agentContext?.goToRandomProject();
              }}
            >
              Surprise me
            </button>
            <button
              onClick={() => {
                agentContext?.talkToAgent("Summarize all of Dylan's projects.");
              }}
            >
              The full tour
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
