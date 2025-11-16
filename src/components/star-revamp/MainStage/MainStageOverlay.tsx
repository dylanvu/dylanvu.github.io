import { motion } from "motion/react";
import { useMainStageOverlayContext } from "@/hooks/useMainStageOverlayProvider";
import { FadeLetters } from "./FadeLetters";
import { FANCY_FONT_FAMILY, FONT_FAMILY, SPACE_TEXT_COLOR } from "@/app/theme";

export default function MainStageOverlay() {
  const { titleText, originText, aboutText, introText } =
    useMainStageOverlayContext();

  const lines = [
    { key: "intro-text", text: introText, size: "1.2rem" },
    { key: "title", text: titleText, size: "5.5rem" },
    { key: "origin", text: originText, size: "1.2rem" },
    { key: "about", text: aboutText, size: "1.2rem" },
  ];

  const visibleLines = lines.filter((l) => !!l.text);
  const lineDuration = 0.5;
  const overlapFactor = 0.2;
  const lineStep = lineDuration * (1 - overlapFactor);

  return (
    <motion.div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: "1rem",
        zIndex: 10,
        pointerEvents: "none",
      }}
    >
      {visibleLines.map((line, index) => (
        <FadeLetters
          key={line.key}
          text={line.text!}
          size={line.size}
          color={SPACE_TEXT_COLOR}
          duration={lineDuration}
          lineIndex={index}
          lineStep={lineStep}
          fontFamily={index === 1 ? FANCY_FONT_FAMILY : FONT_FAMILY}
        />
      ))}
    </motion.div>
  );
}
