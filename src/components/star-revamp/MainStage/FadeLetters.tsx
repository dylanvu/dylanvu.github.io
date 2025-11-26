import { motion, AnimatePresence, Easing } from "motion/react";
import { FONT_FAMILY } from "@/app/theme";
import { NextFont } from "next/dist/compiled/@next/font";

interface FadeLettersProps {
  text: string;
  size?: string | number;
  fontFamily?: NextFont;
  color?: string;
  duration?: number;
  lineIndex?: number;
  lineStep?: number;
  totalLines?: number; // <-- new prop
  yOffset?: number;
  ease?: Easing | Easing[]; // correctly typed easing
}

export function FadeLetters({
  text,
  size,
  fontFamily = FONT_FAMILY,
  color = "white",
  duration = 0.5,
  lineIndex = 0,
  lineStep = 0.4,
  totalLines = 1, // <-- default if not passed
  yOffset = 6,
  ease = [0.42, 0, 0.58, 1], // cubic-bezier works
}: FadeLettersProps) {
  if (!text) return null;

  const letters = text.split("");
  const n = Math.max(1, letters.length);
  const perLetterDuration = duration / n;

  const enterDelay = lineIndex * lineStep;
  // compute exit delay so lines exit in reverse order (bottom -> top)
  const exitDelay = Math.max(0, totalLines - 1 - lineIndex) * lineStep;

  const rootVariants = {
    visible: {
      transition: {
        staggerChildren: perLetterDuration,
        delayChildren: enterDelay,
      },
    },
    hidden: {
      transition: {
        staggerChildren: perLetterDuration,
        staggerDirection: -1, // keep letters inside the line reversing on exit
        delayChildren: exitDelay,
      },
    },
  };

  const letterVariants = {
    hidden: { opacity: 0, y: yOffset },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: perLetterDuration, ease },
    },
    exit: {
      opacity: 0,
      y: yOffset,
      transition: { duration: perLetterDuration, ease },
    },
  };

  return (
    <AnimatePresence mode="wait">
      {text && (
        <motion.div
          key={text}
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={rootVariants}
          style={{ display: "inline-block" }}
        >
          {letters.map((letter, i) => (
            <motion.span
              key={i}
              style={{
                display: "inline-block",
                verticalAlign: "top",
                fontSize: size,
                color,
                fontFamily: fontFamily.style.fontFamily,
                lineHeight: 1,
              }}
              variants={letterVariants}
            >
              {letter === " " ? "\u00A0" : letter}
            </motion.span>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
