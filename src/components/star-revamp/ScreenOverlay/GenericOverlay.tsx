import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FANCY_FONT_FAMILY, FONT_FAMILY, SPACE_TEXT_COLOR } from "@/app/theme";
import DrawLetters from "@/components/star-revamp/MainStage/DrawLetters";
import { FadeLine } from "@/components/star-revamp/MainStage/FadeLine";
import { useWindowSizeContext } from "@/hooks/useWindowSizeProvider";
import { useMobile } from "@/hooks/useMobile";

export default function GenericOverlay({
  /* eslint-disable @typescript-eslint/no-unused-vars */
  overlayName,
  titleText,
  originText,
  aboutText,
  introText,
  overlayVisibility,
  titlePosition,
  horizontalPosition = "center",
}: {
  overlayName: string;
  titleText: string;
  originText: string;
  aboutText: string;
  introText: string;
  overlayVisibility: boolean;
  titlePosition: "center" | "bottom" | "top";
  horizontalPosition?: "left" | "center" | "right";
}) {
  const { width } = useWindowSizeContext();
  const { mobileFontScaleFactor } = useMobile();

  // Helper to scale rem values
  const scaleFontSize = (size: string): string => {
    const match = size.match(/^([\d.]+)rem$/);
    if (match) {
      const value = parseFloat(match[1]);
      return `${value * mobileFontScaleFactor}rem`;
    }
    return size;
  };

  // Calculate X offset based on window width
  // Center = 0
  // Left Half Center = -width / 4 (Shift left by 25% of screen)
  // Right Half Center = width / 4  (Shift right by 25% of screen)
  const xOffset = useMemo(() => {
    if (horizontalPosition === "left") return -width / 4;
    if (horizontalPosition === "right") return width / 4;
    return 0;
  }, [width, horizontalPosition]);

  const OverlayPositionToCSS = {
    center: 0,
    bottom: "40vh",
    top: "-35vh",
  };

  const lines = useMemo(() => {
    return [
      { key: "intro-text", text: introText ?? "", size: scaleFontSize("1.2rem") },
      { key: "title", text: titleText ?? "", size: scaleFontSize("5.5rem") },
      { key: "origin", text: originText ?? "", size: scaleFontSize("1.2rem") },
      { key: "about", text: aboutText ?? "", size: scaleFontSize("1.2rem") },
    ];
  }, [introText, titleText, originText, aboutText, mobileFontScaleFactor]);

  const visibleLines = lines.filter(
    (l) => l.text !== undefined && l.text !== null
  );

  const contentKey = visibleLines.map((l) => l.text ?? "").join("|");

  const titleIndex = visibleLines.findIndex((l) => l.key === "title");
  const hasDrawnTitle = titleIndex !== -1;

  const [showOtherLines, setShowOtherLines] = useState(!hasDrawnTitle);

  useEffect(() => {
    if (overlayVisibility) {
      setShowOtherLines(!hasDrawnTitle);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overlayVisibility, contentKey]);

  const staggerDelay = 0.16;
  const gap = 0.8;
  const gapUnit = "rem";
  const gapValue = gap + gapUnit;
  const gapTitleOverride = -1 * 1.5 * gap + gapUnit;

  return (
    <AnimatePresence
      mode="wait"
      onExitComplete={() => {
        setShowOtherLines(!hasDrawnTitle);
      }}
    >
      {overlayVisibility && (
        <motion.div
          key={`overlay-${contentKey}`}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignContent: "center",
            alignItems: "center",
            flexDirection: "column",
            gap: gapValue,
            zIndex: 10,
            pointerEvents: "none",
            // Vertical positioning (Y)
            y: OverlayPositionToCSS[titlePosition],
            // Horizontal positioning (X)
            x: xOffset,
          }}
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
            // Ensure we animate to the calculated X if it changes while mounted
            x: xOffset,
            y: OverlayPositionToCSS[titlePosition],
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }} // Increased duration slightly for smoother movement
        >
          {visibleLines.map((line, idx) => {
            if (idx === titleIndex) {
              return (
                <div
                  key={`${line.key}-${line.text}`}
                  style={{
                    display: "inline-block",
                    marginBottom: gapTitleOverride,
                    marginTop: gapTitleOverride,
                  }}
                >
                  <DrawLetters
                    key={`${line.key}-${line.text}`}
                    text={line.text}
                    onComplete={() => {
                      setShowOtherLines(true);
                    }}
                    fontSize={
                      typeof line.size === "number" ? line.size : undefined
                    }
                  />
                </div>
              );
            }

            return (
              <div
                key={`${line.key}-${line.text ?? ""}`}
                style={{ display: "inline-block" }}
              >
                {showOtherLines ? (
                  <FadeLine
                    key={`${line.key}-${line.text}`}
                    text={line.text}
                    size={line.size}
                    color={SPACE_TEXT_COLOR}
                    duration={0.42}
                    fontFamily={
                      idx === titleIndex ? FANCY_FONT_FAMILY : FONT_FAMILY
                    }
                    delay={idx * staggerDelay}
                  />
                ) : (
                  <div
                    aria-hidden
                    style={{
                      fontSize: line.size,
                      lineHeight: 1.2,
                      display: "inline-block",
                      color: "transparent",
                      visibility: "hidden",
                      whiteSpace: "pre",
                    }}
                  >
                    {"\u00A0"}
                  </div>
                )}
              </div>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
