import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FANCY_FONT_FAMILY, FONT_FAMILY, SPACE_TEXT_COLOR, TEXT_SIZE, DURATION } from "@/app/theme";
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
    top: "-30vh", // -35 for the big screen
  };

  const lines = useMemo(() => {
    return [
      { key: "intro-text", text: introText ?? "", size: scaleFontSize(TEXT_SIZE.xl) },
      { key: "title", text: titleText ?? "", size: scaleFontSize(TEXT_SIZE["6xl"]) },
      { key: "origin", text: originText ?? "", size: scaleFontSize(TEXT_SIZE.xl) },
      { key: "about", text: aboutText ?? "", size: scaleFontSize(TEXT_SIZE.xl) },
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

  // Detect if title text has descending letters (g, j, p, q, y)
  const hasDescenders = (text: string) => {
    if (!text) return false;
    return /[gjpqy]/.test(text);
  };

  // Top margin: Always use the old logic
  const gapTitleOverrideTop = -1 * 1.5 * gap + gapUnit;

  // Bottom margin: If title has descenders, keep normal spacing. Otherwise, reduce for tighter fit
  const gapTitleOverrideBottom = useMemo(() => {
    const multiplier = hasDescenders(titleText) ? 1.5 : 3.5;
    return -1 * multiplier * gap + gapUnit;
  }, [titleText, gap, gapUnit]);

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
                    marginBottom: gapTitleOverrideBottom,
                    marginTop: gapTitleOverrideTop,
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
                    duration={DURATION.normal}
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
