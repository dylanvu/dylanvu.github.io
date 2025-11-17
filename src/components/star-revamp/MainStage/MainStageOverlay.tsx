import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useMainStageOverlayContext } from "@/hooks/useMainStageOverlayProvider";
import { FANCY_FONT_FAMILY, FONT_FAMILY, SPACE_TEXT_COLOR } from "@/app/theme";
import DrawLetters from "./DrawLetters";
import { FadeLine } from "./FadeLine";

export default function MainStageOverlay() {
  const {
    titleText,
    originText,
    aboutText,
    introText,
    overlayVisibility,
    titlePosition,
  } = useMainStageOverlayContext();

  const lines = useMemo(
    () => [
      { key: "intro-text", text: introText ?? "", size: "1.2rem" },
      { key: "title", text: titleText ?? "", size: "5.5rem" },
      { key: "origin", text: originText ?? "", size: "1.2rem" },
      { key: "about", text: aboutText ?? "", size: "1.2rem" },
    ],
    [introText, titleText, originText, aboutText]
  );

  const visibleLines = lines.filter(
    (l) => l.text !== undefined && l.text !== null
  );

  // Build a content key from line texts — changing this triggers exit -> enter (mode="wait")
  const contentKey = visibleLines.map((l) => l.text ?? "").join("|");

  // find the title index if present
  const titleIndex = visibleLines.findIndex((l) => l.key === "title");
  const hasDrawnTitle = titleIndex !== -1;

  // showOtherLines controls whether non-title lines mount (they should wait for draw)
  const [showOtherLines, setShowOtherLines] = useState(!hasDrawnTitle);

  // When overlay opens or content key changes (after exit), reset showOtherLines to hide other lines
  // until DrawLetters calls onComplete. Using contentKey in effect ensures we reset for new content.
  useEffect(() => {
    if (overlayVisibility) {
      setShowOtherLines(!hasDrawnTitle);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overlayVisibility, contentKey]);

  const staggerDelay = 0.16;

  return (
    <AnimatePresence
      mode="wait"
      onExitComplete={() => {
        // The old content has fully exited; the new container will mount now.
        // Reset showOtherLines for the incoming content (if it has a drawn title).
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
            alignItems: "center",
            flexDirection: "column",
            gap: "1rem",
            zIndex: 10,
            pointerEvents: "none",
            y: titlePosition === "bottom" ? "35vh" : 0, // move down
          }}
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16, ease: "easeInOut" }}
        >
          {visibleLines.map((line, idx) => {
            if (idx === titleIndex) {
              // Title: DrawLetters. Start drawing as soon as it mounts.
              return (
                <div
                  key={`${line.key}-${line.text}`}
                  style={{ display: "inline-block" }}
                >
                  <DrawLetters
                    key={`${line.key}-${line.text}`} // force rerender when text changes
                    text={line.text}
                    // when the draw completes, reveal the other lines immediately
                    onComplete={() => {
                      // slight microtask yield to allow DOM update, but this is immediate
                      setShowOtherLines(true);
                    }}
                    // tune duration & stagger if you want even snappier or slower draws:
                    // duration={1500}
                    // stagger={30}
                    fontSize={
                      typeof line.size === "number" ? line.size : undefined
                    }
                  />
                </div>
              );
            }

            // Non-title lines: show placeholder while waiting, then mount FadeLine which animates.
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
                  // placeholder to reserve layout space while waiting for draw to finish:
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
