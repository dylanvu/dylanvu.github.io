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
// A reusable helper to handle inline formatting like **bold** and ![images]()
function renderInlineFormatting(text: string) {
  // New regex splits by EITHER bold OR image syntax, keeping the delimiters.
  const parts = text.split(/(\*\*.*?\*\*|!\[.*?\]\(.*?\))/g);

  return parts.map((part, index) => {
    // Check for bold text
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    // NEW: Check for image syntax
    if (part.startsWith("![") && part.endsWith(")")) {
      // Extract the alt text and src using another regex
      const match = /!\[(.*?)\]\((.*?)\)/.exec(part);
      if (match) {
        const alt = match[1];
        const src = match[2];
        return <img key={index} src={src} alt={alt} className="chat-image" />;
      }
    }

    // Otherwise, it's just regular text
    return part;
  });
}

// The main function to render the entire message
function renderMessageContent(message: string) {
  // This regex is now more specific. It ensures lines start with * or -
  // followed by a space, and groups them.
  const blocks = message.split(/((?:(?:^[\*\-]\s).*(?:\n|$))+)/gm);

  return blocks.map((block, index) => {
    if (!block.trim()) {
      return null;
    }

    // MORE ROBUST CHECK: Test if the block is a list using regex.
    // This ensures it only matches lines that START with a list marker.
    if (/^[\*\-]\s/.test(block.trim())) {
      const listItems = block.split("\n").filter((line) => line.trim());

      return (
        <ul key={`list-${index}`} className="chat-list">
          {listItems.map((item, itemIndex) => {
            const itemContent = item.substring(item.indexOf(" ") + 1).trim();
            return (
              <li key={`item-${itemIndex}`}>
                {renderInlineFormatting(itemContent)}
              </li>
            );
          })}
        </ul>
      );
    }

    // It's not a list, so treat it as paragraphs
    const paragraphs = block.split(/\n\s*\n/).filter((p) => p.trim());

    return paragraphs.map((paragraph, pIndex) => (
      <div key={`text-${index}-${pIndex}`} className="chat-paragraph">
        {renderInlineFormatting(paragraph)}
      </div>
    ));
  });
}
