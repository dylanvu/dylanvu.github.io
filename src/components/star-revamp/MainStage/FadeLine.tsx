// FadeLine.tsx
import { motion } from "motion/react";
import { NextFont } from "next/dist/compiled/@next/font";
import React from "react";

interface FadeLineProps {
  text: string;
  size?: string | number;
  color?: string;
  duration?: number;
  fontFamily?: NextFont ;
  delay?: number; // stagger delay (seconds)
  style?: React.CSSProperties;
}

export function FadeLine({
  text,
  size = "1.2rem",
  color = "white",
  duration = 0.5,
  fontFamily,
  delay = 0,
  style = {},
}: FadeLineProps) {
  // Ensure the DOM never collapses for empty/space-only lines:
  const displayText = text && text.trim() !== "" ? text : "\u00A0";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration, delay }}
      style={{
        fontSize: size,
        color,
        lineHeight: 1.2,
        display: "inline-block",
        whiteSpace: "pre", // preserve spacing if any
        ...style,
      }}
      // support NextFont objects (className), or plain strings if you pass style.fontFamily
      className={fontFamily?.className}
    >
      {displayText}
    </motion.div>
  );
}
