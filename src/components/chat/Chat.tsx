"use client";

import { useEffect, useRef, useState } from "react";
import { useAgentContext } from "@/contexts/ai/AgentContext";
import "@/styles/chat/chat.css";
import ChatHistory from "@/components/chat/ChatHistory";
import ChatInput from "./ChatInput";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRobot } from "@fortawesome/free-solid-svg-icons";
import { AnimatePresence, motion, useAnimate } from "motion/react";

export default function Chat() {
  const agentContext = useAgentContext();

  const [showChat, setShowChat] = useState<boolean>(false);
  /**
   * Ref to show the chat automatically after a delay, on initial render
   */
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  function toggleChat() {
    if (timerRef.current) {
      // Cancel the timer if it's still running
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setShowChat((prev) => !prev);
  }

  useEffect(() => {
    // TODO: make it so that the chat automatically opens up when you go past the navbar
    // TODO: or, make it so that the robot sends a little message saying "Got any questions?" without opening the chat
    // set up delayed automatic chat showing
    timerRef.current = setTimeout(() => {
      setShowChat(true);
      timerRef.current = null;
    }, 2000);

    // clean up timer if chat unrenders
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    // TODO: be able to resize the chat window
    <div className="chat-container">
      <AnimatePresence>
        {showChat && (
          <motion.div
            className="chat-content-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ ease: "easeInOut", duration: 0.2 }}
            key="chat-content-container"
          >
            <div className="chat-header">Dylan's Tour Guide</div>
            <div className="chat-main">
              <ChatHistory />
              <ChatInput />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        className={`show-chat-button ${showChat ? null : "shimmer"}`}
        onClick={toggleChat}
      >
        <FontAwesomeIcon icon={faRobot} className="show-chat-button-icon" />
      </button>
    </div>
  );
}
