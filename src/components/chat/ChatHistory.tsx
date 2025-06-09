"use client";

import { useAgentContext } from "@/contexts/ai/AgentContext";
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
                    {renderMessageContent(message.message)}
                  </div>
                ) : (
                  message.message
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      <div className="chat-history-presets">
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
      </div>
    </div>
  );
}

// honestly I used an LLM for this part but I understand it
// A reusable helper to handle inline formatting like **bold**
function renderInlineFormatting(text: string) {
  // Regex to find chunks of text wrapped in **
  const parts = text.split(/(\*\*.*?\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

// The main function to render the entire message
function renderMessageContent(message: string) {
  // Regex to split the message by list blocks
  const blocks = message.split(/((?:[\*\-] .+\n?)+)/g);

  return blocks.map((block, index) => {
    if (!block.trim()) {
      return null;
    }

    // Check if this block is a list
    if (block.trim().startsWith("* ") || block.trim().startsWith("- ")) {
      const listItems = block.split("\n").filter((line) => line.trim());

      return (
        <ul key={`list-${index}`} className="chat-list">
          {listItems.map((item, itemIndex) => {
            const itemContent = item.substring(item.indexOf(" ") + 1); // More robust than substring(2)
            return (
              <li key={`item-${itemIndex}`}>
                {renderInlineFormatting(itemContent)}
              </li>
            );
          })}
        </ul>
      );
    }

    // If it's not a list, treat it as one or more paragraphs.
    // Split the block by double newlines to create paragraphs.
    const paragraphs = block.split(/\n\s*\n/).filter((p) => p.trim());

    return paragraphs.map((paragraph, pIndex) => (
      <div key={`text-${index}-${pIndex}`} className="chat-paragraph">
        {renderInlineFormatting(paragraph)}
      </div>
    ));
  });
}
