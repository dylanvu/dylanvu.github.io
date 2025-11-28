import { motion } from "motion/react";
import { FONT_FAMILY, SPACE_TEXT_COLOR, GLASS, RADIUS, DURATION, TEXT_SIZE, SPACING } from "@/app/theme";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { usePolarisContext } from "@/hooks/Polaris/usePolarisProvider";

export default function StargazerMessage({ message }: { message: string }) {
  const [showGlass, setShowGlass] = useState(false);
  const { polarisDisplayState } = usePolarisContext();

  useEffect(() => {
    // Reset blur when panel is hidden
    if (polarisDisplayState !== "active") {
      setShowGlass(false);
      return;
    }
    
    // Start blur timer when panel becomes active, matching the panel fade-in duration
    const timer = setTimeout(() => {
      setShowGlass(true);
    }, DURATION.normal * 1000); // Match MainStage panel opacity animation
    
    return () => clearTimeout(timer);
  }, [polarisDisplayState]);

  return (
    <motion.div
      // FIX: Removed 'x: 10' to prevent right-side overflow/expansion
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: DURATION.normal, ease: "easeOut" }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        alignSelf: "flex-end",
        maxWidth: "30%",
        // Ensure the container itself doesn't stretch nicely
        transformOrigin: "bottom right",
        pointerEvents: polarisDisplayState === "active" ? "auto" : "none",
      }}
      className={FONT_FAMILY.className}
    >
      <span
        style={{
          fontSize: TEXT_SIZE.xs,
          opacity: 0.6,
          marginBottom: SPACING.xs,
          marginRight: SPACING.md,
        }}
      >
        You
      </span>
      <div
        style={{
          background: GLASS.strong.background,
          border: GLASS.strong.border,
          backdropFilter: showGlass ? "blur(12px)" : "none",
          color: SPACE_TEXT_COLOR,
          padding: `${SPACING.md} ${SPACING.lg}`,
          borderRadius: `${RADIUS.lg} ${RADIUS.lg} ${RADIUS.sm} ${RADIUS.lg}`,
          lineHeight: "1.5",
          wordWrap: "break-word",
          transition: `backdrop-filter ${DURATION.normal}s ease`,
        }}
      >
        <ReactMarkdown>{message}</ReactMarkdown>
      </div>
    </motion.div>
  );
}
