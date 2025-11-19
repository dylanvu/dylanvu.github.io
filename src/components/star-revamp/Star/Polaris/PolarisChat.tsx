"use client";
import { usePolarisContext } from "@/hooks/Polaris/usePolarisProvider";
import StargazerMessage from "@/components/star-revamp/Star/Polaris/StargazerMessage";
import PolarisMessage from "@/components/star-revamp/Star/Polaris/PolarisMessage";
import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FONT_FAMILY } from "@/app/theme";

export default function PolarisChat() {
  const { polarisHistory, talkToPolaris, isThinking } = usePolarisContext();
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
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          marginBottom: "1rem",
          paddingRight: "0.5rem",
          scrollbarGutter: "stable",
          marginRight: "4rem",
          marginLeft: "4rem",
        }}
      >
        <AnimatePresence initial={false}>
          {polarisHistory.map((message, i) => {
            const key = `polaris-chat-${i}`;
            return message.role === "user" ? (
              <StargazerMessage key={key} message={message.message} />
            ) : (
              <PolarisMessage key={key} message={message.message} />
            );
          })}
        </AnimatePresence>

        {/* 4. REMOVED the dummy div entirely */}
      </div>

      {/* Suggestion Chips */}
      <div
        style={{
          width: "30%",
          margin: "auto",
          marginBottom: "4rem",
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
              disabled={isThinking}
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
              isThinking ? "Polaris is thinking..." : "Consult Polaris..."
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isThinking}
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
            disabled={isThinking}
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
