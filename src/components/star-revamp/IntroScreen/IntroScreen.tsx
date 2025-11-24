"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { usePathname } from "next/navigation";
import {
  FONT_FAMILY,
  SPACE_TEXT_COLOR,
} from "@/app/theme";

function getIntroTextForPath(pathname: string): string[] {
  if (pathname.startsWith("/star/")) {
    return [
      "In this star that you found",
      "As it twinkles and glints",
      "Discover its story",
    ];
  }
  
  if (pathname.startsWith("/constellation/")) {
    return [
      "A tapestry woven by stars",
      "The constellation blooms",
      "Explore this corner of the sky",
    ];
  }
  
  if (pathname === "/polaris" || pathname.startsWith("/polaris/")) {
    return [
      "The North Star awaits",
      "A guide for the stars",
      "Ask, and Polaris answers",
    ];
  }
  
  // Default for "/" and any other paths
  return [
    "Every star, a part of me",
    "Every constellation, a guide for you",
    "Welcome to my night sky",
  ];
}

export default function IntroScreen({
  setIntroDoneAction,
}: {
  setIntroDoneAction: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const pathname = usePathname();
  const INTRO_TEXT = getIntroTextForPath(pathname);

  const FADE_DURATION = 1; // seconds per line
  const STAGGER_DURATION = 2; // delay between lines
  const VISIBLE_DURATION = 1; // how long all lines stay fully visible
  const GAP = "1.5rem"; // <- change this to adjust spacing between lines

  const [show, setShow] = useState(true);

  // Calculate total delay before container should fade out
  const totalDelay =
    FADE_DURATION + // first line fade-in
    STAGGER_DURATION * (INTRO_TEXT.length - 1) + // stagger for remaining lines
    VISIBLE_DURATION;

  useEffect(() => {
    const timeout = setTimeout(() => setShow(false), totalDelay * 1000);
    return () => clearTimeout(timeout);
  }, [totalDelay]);

  return (
    <AnimatePresence
      onExitComplete={() => {
        setIntroDoneAction(true);
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
                fontSize: "2rem",
                marginTop: i === 0 ? 0 : GAP, // <- apply gap only after first element
              }}
              className={FONT_FAMILY.className}
            >
              {text}
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
