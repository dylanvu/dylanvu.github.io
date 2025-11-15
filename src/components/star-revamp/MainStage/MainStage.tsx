"use client";

import {
  FONT_FAMILY,
  SPACE_BACKGROUND_COLOR,
  SPACE_TEXT_COLOR,
} from "@/app/theme";
import { Layer, Stage } from "react-konva";
import BackgroundStarField from "@/components/star-revamp/Star/BackgroundStarField";
import MainStarField from "@/components/star-revamp/Star/MainStarField";
import { motion, AnimatePresence } from "motion/react";
import { useWindowSizeContext } from "@/hooks/useWindowSizeProvider";
import { useRef } from "react";

export default function MainStage() {
  const containerRef = useRef<HTMLDivElement>(null!);

  // use the hook. ready becomes true after the first synchronous measurement.
  const { width, height, ready } = useWindowSizeContext();
  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* full screen overlay */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            color: SPACE_TEXT_COLOR,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            gap: "1rem",
          }}
          className={FONT_FAMILY.className}
        >
          <div
            style={{
              fontSize: "5rem",
            }}
          >
            Dylan Vu
          </div>
          <div>Explore a constellation to learn more</div>
        </motion.div>
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
            />
            <MainStarField />
          </Layer>
        </Stage>
      )}
    </div>
  );
}
