import { motion, AnimatePresence } from "motion/react";
import { FONT_FAMILY } from "@/app/theme";
import { NextFont } from "next/dist/compiled/@next/font";

interface FadeLettersProps {
  text: string;
  size?: string | number;
  fontFamily?: NextFont;
  color?: string;
  duration?: number; // total time for all letters
  lineIndex?: number; // index of the line (for staggered line overlap)
  lineStep?: number; // delay step between lines (for overlap)
}

export function FadeLetters({
  text,
  size,
  fontFamily = FONT_FAMILY,
  color = "white",
  duration = 0.5,
  lineIndex = 0,
  lineStep = 0.4,
}: FadeLettersProps) {
  if (!text) return null;

  const letters = text.split("");
  const n = Math.max(1, letters.length);
  const perLetterDuration = duration / n;
  const letterStagger = perLetterDuration;

  // Calculate delay based on line index and overlap step
  const enterDelay = lineIndex * lineStep;
  const exitDelay = lineIndex * lineStep; // can tweak for exit overlap

  const rootVariants = {
    visible: {
      transition: { staggerChildren: letterStagger, delayChildren: enterDelay },
    },
    hidden: {
      transition: {
        staggerChildren: letterStagger,
        staggerDirection: -1,
        delayChildren: exitDelay,
      },
    },
  };

  const letterVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
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
              }}
              variants={letterVariants}
              transition={{ duration: perLetterDuration, ease: "linear" }}
            >
              {letter === " " ? "\u00A0" : letter}
            </motion.span>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
