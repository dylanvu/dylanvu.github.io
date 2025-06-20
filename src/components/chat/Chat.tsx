"use client";

import { useEffect, useRef, useState } from "react";
import "@/styles/chat/chat.css";
import ChatHistory from "@/components/chat/ChatHistory";
import ChatInput from "./ChatInput";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRobot, faUpRightAndDownLeftFromCenter, faDownLeftAndUpRightToCenter, faWindowMinimize } from "@fortawesome/free-solid-svg-icons";
import { AnimatePresence, motion } from "motion/react";

export default function Chat() {
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

  const LARGE_CHAT_WIDTH = "80vw";
  const LARGE_CHAT_WIDTH_MOBILE = "85vw";
  const LARGE_CHAT_HEIGHT = "80vh";
  const SMALL_CHAT_WIDTH = "20vw";
  const SMALL_CHAT_WIDTH_MOBILE = "85vw";

  const [chatSize, setChatSize] = useState<"small" | "large">("small");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1023);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Call once to set initial state

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currentWidth = chatSize === "small"
  ? (isMobile ? SMALL_CHAT_WIDTH_MOBILE : SMALL_CHAT_WIDTH)
  : (isMobile ? LARGE_CHAT_WIDTH_MOBILE : LARGE_CHAT_WIDTH);

  const currentHeight = chatSize === "small" ? "auto" : LARGE_CHAT_HEIGHT;

  function toggleChatSize() {
    setChatSize(chatSize === "large" ? "small" : "large")
  }

  return (
    // TODO: be able to resize the chat window
    <div className="chat-container">
      <AnimatePresence>
        {showChat && (
          <motion.div
            className="chat-content-container"
            initial={{ opacity: 0, height: currentHeight, width: currentWidth }}
            animate={{ opacity: 1, height: currentHeight, width: currentWidth }}
            exit={{ opacity: 0 }}
            transition={{ ease: "easeInOut", duration: 0.2 }}
            key="chat-content-container"
          >
            <div className="chat-header">
              <div className="chat-header-title">
                Dylan&apos;s Tour Guide
              </div>
              <div className="chat-header-buttons">
                <button onClick={toggleChatSize}>
                  <FontAwesomeIcon icon={ chatSize === "small" ? faUpRightAndDownLeftFromCenter : faDownLeftAndUpRightToCenter}/>
                </button>
                <button onClick={toggleChat}>
                  <FontAwesomeIcon icon={faWindowMinimize}/>
                </button>
              </div>
            </div>
            <ChatHistory />
            <ChatInput />
          </motion.div>
        )}
      </AnimatePresence>
      <button
        className={`show-chat-button ${showChat && "shimmer"}`}
        onClick={toggleChat}
      >
        <FontAwesomeIcon icon={faRobot} className="show-chat-button-icon" />
      </button>
    </div>
  );
}
