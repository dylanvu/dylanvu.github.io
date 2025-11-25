"use client";
import { usePolarisContext } from "@/hooks/Polaris/usePolarisProvider";
import StargazerMessage from "@/components/star-revamp/Star/Polaris/StargazerMessage";
import PolarisMessage from "@/components/star-revamp/Star/Polaris/PolarisMessage";
import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { 
  FONT_FAMILY, 
  GLASS, 
  RADIUS, 
  DURATION, 
  OPACITY,
  TEXT_SIZE,
  SPACING,
  SHADOW,
} from "@/app/theme";

export default function PolarisChat() {
  const { polarisHistory, talkToPolaris, isThinking, isTalking, setPolarisDisplayState } = usePolarisContext();
  const [inputText, setInputText] = useState("");
  const [showGlass, setShowGlass] = useState(false);

  // 1. Change ref to target the container instead of a dummy div
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Activate glass effect after parent fade-in completes
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowGlass(true);
    }, DURATION.normal * 1000); // Wait for parent animation to finish
    return () => clearTimeout(timer);
  }, []);

  const suggestions = [
    "What does \"night sky\" mean?",
    "What are Dylan's technical skills?",
    "Where is Dylan's resume?",
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

  const disabledChatInput = isThinking || isTalking

  const handleClose = () => {
    setPolarisDisplayState(prev => prev === "active" ? "hidden" : "active");
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
        overscrollBehavior: "contain",
        paddingBottom: "2rem",
        paddingTop: "2rem"
      }}
      className={FONT_FAMILY.className}
    >
      {/* Close Button */}
      <button
        onClick={handleClose}
        style={{
          position: "absolute",
          top: "1.5rem",
          right: "1.5rem",
          width: "2rem",
          height: "2rem",
          borderRadius: RADIUS.circle,
          background: GLASS.medium.background,
          border: GLASS.medium.border,
          backdropFilter: showGlass ? "blur(12px)" : "none",
          color: "white",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.2rem",
          transition: `backdrop-filter ${DURATION.normal}s ease, transform ${DURATION.fast}s, background ${DURATION.fast}s`,
          zIndex: 10,
          pointerEvents: "auto",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = `rgba(255, 255, 255, ${OPACITY.strong})`;
          e.currentTarget.style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = GLASS.medium.background;
          e.currentTarget.style.transform = "scale(1)";
        }}
        aria-label="Close Polaris"
      >
        ✕
      </button>
      {/* Scrollbar Styling */}
      <style jsx global>{`
        .polaris-scroll-container::-webkit-scrollbar {
          width: 6px;
        }
        .polaris-scroll-container::-webkit-scrollbar-track {
          background: transparent;
        }
        .polaris-scroll-container::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, ${OPACITY.bold});
          border-radius: 10px;
        }
        .polaris-scroll-container::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, ${OPACITY.semitransparent});
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
              onMouseEnter={(e) => {
                if (!disabledChatInput) {
                  e.currentTarget.style.background = GLASS.medium.background;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = GLASS.light.background;
              }}
              style={{
                background: GLASS.light.background,
                border: GLASS.light.border,
                backdropFilter: showGlass ? "blur(8px)" : "none",
                color: "inherit",
                padding: `${SPACING.sm} ${SPACING.md}`,
                borderRadius: RADIUS.lg,
                fontSize: TEXT_SIZE.xs,
                cursor: disabledChatInput ? "not-allowed" : "pointer",
                opacity: disabledChatInput ? OPACITY.half : 1,
                transition: `backdrop-filter ${DURATION.normal}s ease, background ${DURATION.fast}s`,
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
            background: GLASS.medium.background,
            border: GLASS.medium.border,
            backdropFilter: showGlass ? "blur(12px)" : "none",
            borderRadius: RADIUS.pill,
            padding: `${SPACING.sm} ${SPACING.sm} ${SPACING.sm} ${SPACING.lg}`,
            boxShadow: SHADOW.md,
            pointerEvents: "all",
            transition: `backdrop-filter ${DURATION.normal}s ease`,
          }}
        >
          <input
            type="text"
            placeholder={polarisInputPlaceholder}
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
              fontSize: TEXT_SIZE.base,
              opacity: disabledChatInput ? OPACITY.half : 1,
              transition: `opacity ${DURATION.fast}s ease`,
            }}
            className={FONT_FAMILY.className}
          />
          <button
            onClick={() => handleSubmit()}
            disabled={disabledChatInput}
            onMouseEnter={(e) => {
              if (!disabledChatInput) {
                e.currentTarget.style.background = `rgba(255, 255, 255, ${OPACITY.bolder})`;
                e.currentTarget.style.transform = "scale(1.05)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = `rgba(255, 255, 255, ${OPACITY.bold})`;
              e.currentTarget.style.transform = "scale(1)";
            }}
            style={{
              width: "2.2rem",
              height: "2.2rem",
              borderRadius: RADIUS.circle,
              border: "none",
              background: `rgba(255, 255, 255, ${OPACITY.bold})`,
              color: "white",
              cursor: disabledChatInput ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginLeft: SPACING.sm,
              transition: `all ${DURATION.fast}s ease`,
              opacity: disabledChatInput ? OPACITY.half : 1,
            }}
            aria-label="Send message"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
