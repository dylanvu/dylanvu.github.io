"use client";

import {
  FONT_FAMILY,
  SPACE_BACKGROUND_COLOR,
  SPACE_TEXT_COLOR,
} from "@/app/theme";
import { Layer, Stage } from "react-konva";
import BackgroundStarField from "@/components/star-revamp/Star/BackgroundStarField";
import MainStarField from "@/components/star-revamp/Star/MainStarField";
import { useWindowSizeContext } from "@/hooks/useWindowSizeProvider";
import CenterOverlay from "@/components/star-revamp/ScreenOverlay/CenterOverlay";
import TopOverlay from "@/components/star-revamp/ScreenOverlay/TopOverlay";
import { motion, AnimatePresence } from "motion/react";
import { usePathname } from "next/navigation";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ConstellationData } from "@/interfaces/StarInterfaces";

const panelStyle: React.CSSProperties = {
  position: "absolute",
  color: SPACE_TEXT_COLOR,
  overflowY: "auto",
  width: "30%",
  height: "100%",
  zIndex: 11,
  background: "rgba(256,0,0,0.3)",
  right: 0,
  padding: "1rem",
  cursor: "auto",
};

export default function MainStage({ children }: { children: React.ReactNode }) {
  const { width, height, ready } = useWindowSizeContext();
  const pathname = usePathname();
  const [focusedConstellationPos, setFocusedConstellationPos] = useState<{
    x: number;
    y: number;
    constellation: ConstellationData;
  } | null>(null);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
    >
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
              starCount={200}
              focusedConstellationPos={focusedConstellationPos}
            />
            <MainStarField
              setFocusedConstellationPosAction={setFocusedConstellationPos}
            />
          </Layer>
        </Stage>
      )}
    </div>
  );
}
