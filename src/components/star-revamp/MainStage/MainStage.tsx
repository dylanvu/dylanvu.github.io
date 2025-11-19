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
import React, { useState } from "react";
import { FocusedConstellationPos } from "@/interfaces/StarInterfaces";

import {
  hexToRgba,
  SECONDARY_SPACE_COLOR,
  SPACE_TEXT_COLOR,
} from "@/app/theme";
import { TargetAndTransition, VariantLabels, Transition } from "motion/react";

export const StarPanelStyle: React.CSSProperties = {
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
  duration: 0.4,
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
  const pathname = usePathname();
  const [focusedConstellationPos, setFocusedConstellationPos] =
    useState<FocusedConstellationPos | null>(null);

  let panelStyle = { ...StarPanelStyle };

  const isPolarisPage = pathname === "/polaris";
  if (isPolarisPage) {
    panelStyle = { ...StarPanelStyle, ...PolarisStyleOverride };
  }

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
                initial={
                  isPolarisPage
                    ? PolarisPanelMotionInitial
                    : StarPanelMotionInitial
                }
                animate={
                  isPolarisPage
                    ? PolarisPanelMotionAnimate
                    : StarPanelMotionAnimate
                }
                exit={
                  isPolarisPage ? PolarisPanelMotionExit : StarPanelMotionExit
                }
                transition={StarPanelMotionTransition}
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
