"use client";

import {
  FONT_FAMILY,
  SECONDARY_SPACE_COLOR,
  SPACE_BACKGROUND_COLOR,
  SPACE_TEXT_COLOR,
  hexToRgba,
} from "@/app/theme";
import { Layer, Stage } from "react-konva";
import BackgroundStarField from "@/components/star-revamp/Star/Background/BackgroundStarField";
import MainStarField from "@/components/star-revamp/Star/MainStarField";
import { useWindowSizeContext } from "@/hooks/useWindowSizeProvider";
import CenterOverlay from "@/components/star-revamp/ScreenOverlay/CenterOverlay";
import TopOverlay from "@/components/star-revamp/ScreenOverlay/TopOverlay";
import { motion, AnimatePresence } from "motion/react";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { FocusedConstellationPos } from "@/interfaces/StarInterfaces";
import { useFocusContext } from "@/hooks/useFocusProvider";

const panelStyle: React.CSSProperties = {
  position: "absolute",
  color: SPACE_TEXT_COLOR,
  overflowY: "auto",
  width: "50%",
  height: "100%",
  zIndex: 11,
  background: hexToRgba(SECONDARY_SPACE_COLOR, 0.7),
  right: 0,
  padding: "1rem",
  cursor: "auto",
};

export default function MainStage({
  children,
  showMainStars,
}: {
  children: React.ReactNode;
  showMainStars?: boolean;
}) {
  const { width, height, ready } = useWindowSizeContext();
  const pathname = usePathname();
  const [focusedConstellationPos, setFocusedConstellationPos] =
    useState<FocusedConstellationPos | null>(null);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: SPACE_BACKGROUND_COLOR,
      }}
    >
      {showMainStars && (
        <>
          <CenterOverlay />
          <TopOverlay />
          <AnimatePresence mode="wait">
            {pathname !== "/" && (
              <motion.div
                key="children"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ duration: 0.2 }}
                style={panelStyle}
                className={FONT_FAMILY.style.fontFamily}
              >
                {children}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
      {ready && width > 0 && height > 0 && (
        <Stage
          width={width}
          height={height}
          style={{ background: SPACE_BACKGROUND_COLOR }}
        >
          <Layer>
            <BackgroundStarField
              width={width}
              height={height}
              focusedConstellationPos={focusedConstellationPos}
            />
            {/* debug square, make it hot pink and large */}
            {/* <Rect
              x={0}
              y={0}
              width={width}
              height={height}
              fill="pink"
              listening={false}
            ></Rect> */}
            {showMainStars && (
              <MainStarField
                setFocusedConstellationPosAction={setFocusedConstellationPos}
              />
            )}
          </Layer>
        </Stage>
      )}
    </div>
  );
}
