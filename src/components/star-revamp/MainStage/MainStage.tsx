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
  StarPanelMotionAnimate,
  StarPanelMotionExit,
  StarPanelMotionInitial,
  StarPanelMotionTransition,
  StarPanelStyle,
} from "@/components/star-revamp/ScreenOverlay/StarPanelStyle";

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
  if (pathname === "/polaris") {
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
                initial={StarPanelMotionInitial}
                animate={StarPanelMotionAnimate}
                exit={StarPanelMotionExit}
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
