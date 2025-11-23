import { motion } from "motion/react";
import { FONT_FAMILY, hexToRgba, SPACE_TEXT_COLOR } from "@/app/theme"; // Assuming this exists based on your snippet
import React from "react";
import ReactMarkdown from "react-markdown";
import { useMobile } from "@/hooks/useMobile";

export default function StargazerMessage({ message }: { message: string }) {
  const { mobileFontScaleFactor } = useMobile();
  return (
    <motion.div
      // FIX: Removed 'x: 10' to prevent right-side overflow/expansion
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        alignSelf: "flex-end",
        maxWidth: "30%",
        // Ensure the container itself doesn't stretch nicely
        transformOrigin: "bottom right",
        pointerEvents: "auto",
      }}
      className={FONT_FAMILY.className}
    >
      <span
        style={{
          fontSize: `${0.7 * mobileFontScaleFactor}rem`,
          opacity: 0.6,
          marginBottom: "0.2rem",
          marginRight: "0.8rem",
        }}
      >
        You
      </span>
      <div
        style={{
          // background: "rgba(255, 255, 255, 0.1)",
          background: hexToRgba(SPACE_TEXT_COLOR, 0.15),
          color: SPACE_TEXT_COLOR,
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          padding: "0.8rem 1.2rem",
          borderRadius: "18px 18px 2px 18px",
          lineHeight: "1.5",
          wordWrap: "break-word", // Ensure long words don't overflow
        }}
      >
        <ReactMarkdown>{message}</ReactMarkdown>
      </div>
    </motion.div>
  );
}
