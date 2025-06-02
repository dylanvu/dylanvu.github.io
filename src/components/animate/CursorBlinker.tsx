"use client";

import { motion } from "motion/react";
import "@/styles/animate/cursor-blinker.css";

const cursorVariants = {
  blinking: {
    opacity: [0, 0, 1, 1],
    transition: {
      duration: 1,
      repeat: Infinity,
      repeatDelay: 0,
      ease: "linear",
      times: [0, 0.5, 0.5, 1],
    },
  },
};

export type validBlinkingCursorTypes = "welcome-cursor" | "text-cursor";

// reference: https://blog.noelcserepy.com/how-i-created-a-typing-text-animation-with-framer-motion
export default function CursorBlinker({
  className,
}: {
  className: validBlinkingCursorTypes;
}) {
  return (
    <motion.div
      variants={cursorVariants}
      animate="blinking"
      // className="inline-block h-5 w-[1px] translate-y-1 bg-slate-900"
      className={`typing-cursor ${className}`}
    />
  );
}
