"use client";

import { FONT_FAMILY, SPACE_BACKGROUND_COLOR } from "@/app/theme";
import { Layer, Stage } from "react-konva";
import BackgroundStarField from "@/components/star-revamp/Star/Background/BackgroundStarField";
import MainStarField from "@/components/star-revamp/Star/MainStarField";
import { useWindowSizeContext } from "@/hooks/useWindowSizeProvider";
import CenterOverlay from "@/components/star-revamp/ScreenOverlay/CenterOverlay";
import TopOverlay from "@/components/star-revamp/ScreenOverlay/TopOverlay";
import { motion, AnimatePresence } from "motion/react";
import { usePathname } from "next/navigation";
import React, { useEffect, useRef } from "react";
import Konva from "konva";

import {
  hexToRgba,
  SECONDARY_SPACE_COLOR,
  SPACE_TEXT_COLOR,
  OPACITY,
  BLUR,
  DURATION,
  SHADOW,
  PANEL,
} from "@/app/theme";
import { TargetAndTransition, VariantLabels, Transition } from "motion/react";
import { usePolarisContext } from "@/hooks/Polaris/usePolarisProvider";
import PolarisChat from "@/components/star-revamp/Star/Polaris/PolarisChat";
import { CONSTELLATION_BASE_URL, STAR_BASE_URL } from "@/constants/Routes";

const BasePanelStyle: React.CSSProperties = {
  position: "absolute",
  color: SPACE_TEXT_COLOR,
  overflowY: "auto",
  width: PANEL.width,
  height: "100%",
  zIndex: 11,
  background: hexToRgba(SECONDARY_SPACE_COLOR, OPACITY.light),
  right: 0,
  cursor: "auto",
}

const StarPanelStyle: React.CSSProperties = {
  background: hexToRgba(SECONDARY_SPACE_COLOR, OPACITY.light),
  backdropFilter: BLUR.heavy,
  borderLeft: `1px solid rgba(255, 255, 255, ${OPACITY.normal})`,
  padding: PANEL.padding,
  boxShadow: SHADOW.lg,
};

type MotionInputs = boolean | TargetAndTransition | VariantLabels | undefined;

export const StarPanelMotionInitial: MotionInputs = {
  opacity: 0,
  x: 100,
};

export const PolarisPanelMotionInitial: MotionInputs = {
  opacity: 0,
};

export const StarPanelMotionAnimate: MotionInputs = {
  opacity: 1,
  x: 0,
};

export const PolarisPanelMotionAnimate: MotionInputs = {
  opacity: 1,
};

export const StarPanelMotionExit:
  | TargetAndTransition
  | VariantLabels
  | undefined = {
  opacity: 0,
  x: 100,
};

export const PolarisPanelMotionExit:
  | TargetAndTransition
  | VariantLabels
  | undefined = {
  opacity: 0,
};

export const StarPanelMotionTransition: Transition = {
  duration: DURATION.normal,
  ease: "easeInOut",
};

const PolarisStyleOverride: React.CSSProperties = {
  height: "100%",
  width: "100%",
  pointerEvents: "none",
  background: "none",
};

export default function MainStage({
  children,
  showMainStars,
}: {
  children: React.ReactNode;
  showMainStars?: boolean;
}) {
  const { width, height, ready } = useWindowSizeContext();
  const { polarisDisplayState } = usePolarisContext();
  const pathname = usePathname();
  
  // Ref to track the Stage instance for cleanup
  const stageRef = useRef<Konva.Stage | null>(null);

  // Cleanup Stage on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (stageRef.current) {
        // Destroy the stage and all its children (layers, shapes, etc.)
        stageRef.current.destroy();
        stageRef.current = null;
      }
    };
  }, []);

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
          
          {/* Star panels - for /star/[slug] pages */}
          <AnimatePresence mode="wait">
            {pathname.startsWith(STAR_BASE_URL) && polarisDisplayState !== "active" && (
              <motion.div
                key="star-panel"
                initial={StarPanelMotionInitial}
                animate={StarPanelMotionAnimate}
                exit={StarPanelMotionExit}
                transition={StarPanelMotionTransition}
                style={{...BasePanelStyle, ...StarPanelStyle}}
                className={FONT_FAMILY.style.fontFamily}
              >
                {children}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Polaris panel - always mounted, animated with Framer Motion */}
          <motion.div
            initial={PolarisPanelMotionInitial}
            animate={{
              opacity: polarisDisplayState === "active" ? 1 : 0,
            }}
            transition={StarPanelMotionTransition}
            style={{
              ...BasePanelStyle,
              ...PolarisStyleOverride,
            }}
            className={FONT_FAMILY.style.fontFamily}
          >
            <PolarisChat />
          </motion.div>
          {/* Hidden container for both /polaris route initialization and constellation navigation */}
          {((pathname === "/polaris" && polarisDisplayState !== "active") || pathname.startsWith(CONSTELLATION_BASE_URL)) && (
            <div style={{ display: 'none' }}>
              {children}
            </div>
          )}
        </>
      )}
      {ready && width > 0 && height > 0 && (
        <Stage
          ref={stageRef}
          width={width}
          height={height}
          style={{ background: SPACE_BACKGROUND_COLOR }}
        >
          <Layer>
            <BackgroundStarField
              width={width}
              height={height}
            />
            {showMainStars && <MainStarField />}
          </Layer>
        </Stage>
      )}
    </div>
  );
}
