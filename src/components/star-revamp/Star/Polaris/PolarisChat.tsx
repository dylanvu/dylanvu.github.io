"use client";
import { usePolarisContext } from "@/hooks/Polaris/usePolarisProvider";
import StargazerMessage from "@/components/star-revamp/Star/Polaris/StargazerMessage";
import PolarisMessage from "@/components/star-revamp/Star/Polaris/PolarisMessage";
import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FONT_FAMILY } from "@/app/theme";

export default function PolarisChat() {
  const { polarisHistory, talkToPolaris, isThinking, isTalking } = usePolarisContext();
  const [inputText, setInputText] = useState("");

  // 1. Change ref to target the container instead of a dummy div
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    "Why is this called a night sky?",
    "How did Dylan build this?",
    "Show me Dylan's projects",
    "Show me Dylan's resume",
  ];

  function handleSubmit(text = inputText) {
    if (!text.trim()) return;
    talkToPolaris(text);
    setInputText("");
  }

  // 2. Scroll the container directly
  useEffect(() => {
    if (scrollContainerRef.current) {
      const { scrollHeight, clientHeight } = scrollContainerRef.current;
      scrollContainerRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior: "smooth",
      });
    }
  }, [polarisHistory]);

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const container = scrollContainerRef.current;
      if (!container) return;

      // 1. Get visual boundaries of the chat container
      const rect = container.getBoundingClientRect();

      // 2. Check if mouse is visually inside the chat area
      const isOverContainer =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      if (isOverContainer) {
        // Prevent default browser scroll behavior (rubber band effect)
        e.preventDefault();
        // 3. Manually scroll the container
        container.scrollTop += e.deltaY;
      }
    };

    // Add listener to window (non-passive to ensure we catch it)
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, []);

  let polarisInputPlaceholder = "Consult Polaris..."

  if (isThinking) {
    polarisInputPlaceholder = "Polaris is thinking..."
  } else if (isTalking) {
    polarisInputPlaceholder = "Polaris is speaking..."
  } else {

  }

  let disabledChatInput = isThinking || isTalking

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        padding: "1rem",
        boxSizing: "border-box",
        position: "relative",
        overflowX: "hidden",
        overscrollBehavior: "contain",
        paddingBottom: "4rem",
        paddingTop: "4rem"
      }}
      className={FONT_FAMILY.className}
    >
      {/* Scrollbar Styling */}
      <style jsx global>{`
        .polaris-scroll-container::-webkit-scrollbar {
          width: 6px;
        }
        .polaris-scroll-container::-webkit-scrollbar-track {
          background: transparent;
        }
        .polaris-scroll-container::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        .polaris-scroll-container::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.4);
        }
      `}</style>

      {/* Chat History Container */}
      <div
        // 3. Attach the ref here
        ref={scrollContainerRef}
        className="polaris-scroll-container"
        style={{
          flex: 1,
          overflowY: "auto",
          overscrollBehavior: "contain",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          scrollbarGutter: "stable",
          paddingRight: "4rem",
          paddingLeft: "4rem",
          marginBottom: "4rem"
        }}
      >
        <AnimatePresence initial={false}>
          {polarisHistory.map((message, i) => {
            const key = `polaris-chat-${i}`;
            return message.role === "user" ? (
              <StargazerMessage key={key} message={message.message} />
            ) : (
              <PolarisMessage key={key} message={message} />
            );
          })}
        </AnimatePresence>

      </div>

      {/* Chat + Suggestion Chips */}
      <div
        style={{
          width: "40%",
          margin: "auto",
          pointerEvents: "none",
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            display: "flex",
            gap: "0.5rem",
            flexWrap: "wrap",
            justifyContent: "flex-end",
            marginBottom: "1rem",
            pointerEvents: "all",
          }}
        >
          {suggestions.map((suggestion, i) => (
            <button
              key={i}
              onClick={() => handleSubmit(suggestion)}
              disabled={disabledChatInput}
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "inherit",
                padding: "0.4rem 0.8rem",
                borderRadius: "20px",
                fontSize: "0.75rem",
                cursor: isThinking ? "not-allowed" : "pointer",
                backdropFilter: "blur(4px)",
                transition: "background 0.2s",
              }}
              className={FONT_FAMILY.className}
            >
              {suggestion}
            </button>
          ))}
        </motion.div>

        {/* Input Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "99px",
            padding: "0.4rem 0.4rem 0.4rem 1.2rem",
            boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
            pointerEvents: "all",
          }}
        >
          <input
            type="text"
            placeholder={
              polarisInputPlaceholder
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabledChatInput}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "inherit",
              fontSize: "0.95rem",
            }}
            className={FONT_FAMILY.className}
          />
          <button
            onClick={() => handleSubmit()}
            disabled={disabledChatInput}
            style={{
              width: "2.2rem",
              height: "2.2rem",
              borderRadius: "50%",
              border: "none",
              background: "rgba(255, 255, 255, 0.2)",
              color: "white",
              cursor: isThinking ? "wait" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginLeft: "0.5rem",
            }}
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
