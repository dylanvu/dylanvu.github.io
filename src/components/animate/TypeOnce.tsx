"use client";
import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { useEffect, useState } from "react";
import CursorBlinker, { validBlinkingCursorTypes } from "./CursorBlinker";

// reference: https://blog.noelcserepy.com/how-i-created-a-typing-text-animation-with-framer-motion
export default function TypeOnce({
  text,
  cursorClass,
  duration,
  removeCursor,
}: {
  text: string;
  cursorClass: validBlinkingCursorTypes;
  duration: number;
  removeCursor: boolean;
}) {
  const count = useMotionValue(0);
  const [showCursor, setShowCursor] = useState(true);
  useEffect(() => {
    const controls = animate(count, text.length, {
      type: "tween",
      duration: duration,
      ease: "linear",
    });
    if (removeCursor) {
      setTimeout(() => {
        setShowCursor(false);
      }, duration * 1000);
    }

    return controls.stop;
  }, []);

  const rounded = useTransform(count, (latest) => Math.round(latest));
  const displayText = useTransform(rounded, (latest) => text.slice(0, latest));

  return (
    <span>
      <motion.span>{displayText}</motion.span>
      {showCursor ? <CursorBlinker className={cursorClass} /> : null}
    </span>
  );
}
