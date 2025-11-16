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
import { useMainStageOverlayContext } from "@/hooks/useMainStageOverlayProvider";
import MainStageOverlay from "./MainStageOverlay";

export default function MainStage() {
  // use the hook. ready becomes true after the first synchronous measurement.
  const { width, height, ready } = useWindowSizeContext();
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
      <MainStageOverlay />
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
