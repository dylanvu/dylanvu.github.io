"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SPACE_BACKGROUND_COLOR, SPACE_TEXT_COLOR } from "@/app/theme";

export default function IntroScreen({
  setIntroDoneAction,
}: {
  setIntroDoneAction: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const INTRO_TEXT = [
    "Each star is a piece of me",
    "Each constellation is a part of who I am",
    "Here is my sky",
  ];

  const FADE_DURATION = 1; // seconds per line
  const STAGGER_DURATION = 2; // delay between lines
  const VISIBLE_DURATION = 1; // how long all lines stay fully visible

  const [show, setShow] = useState(true);

  // Calculate total delay before container should fade out
  const totalDelay =
    FADE_DURATION + // first line fade-in
    STAGGER_DURATION * (INTRO_TEXT.length - 1) + // stagger for remaining lines
    VISIBLE_DURATION;

  // Start container exit after all lines have appeared + visible duration
  useEffect(() => {
    const timeout = setTimeout(() => setShow(false), totalDelay * 1000);
    return () => clearTimeout(timeout);
  }, [totalDelay]);

  return (
    <AnimatePresence
      onExitComplete={() => {
        console.log("Intro complete, parent callback fired!");
        setIntroDoneAction(true); // parent notified reliably
      }}
    >
      {show && (
        <motion.div
          key="intro-container"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: FADE_DURATION }}
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            background: SPACE_BACKGROUND_COLOR,
            color: SPACE_TEXT_COLOR,
            textAlign: "center",
          }}
        >
          {INTRO_TEXT.map((text, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                delay: i * STAGGER_DURATION,
                duration: FADE_DURATION,
              }}
              style={{
                color: SPACE_TEXT_COLOR,
              }}
            >
              {text}
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
