"use client";
import { StarPanelStyle } from "@/components/star-revamp/ScreenOverlay/StarPanelStyle";
import { FONT_FAMILY } from "@/app/theme";
import {
  StarPanelMotionInitial,
  StarPanelMotionAnimate,
  StarPanelMotionExit,
  StarPanelMotionTransition,
} from "@/components/star-revamp/ScreenOverlay/StarPanelStyle";
import { motion } from "motion/react";

export function StarPanelMotionDiv({
  children,
  styleOverride,
}: {
  children: React.ReactNode;
  styleOverride?: React.CSSProperties;
}) {
  return (
    <motion.div
      key="children"
      initial={StarPanelMotionInitial}
      animate={StarPanelMotionAnimate}
      exit={StarPanelMotionExit}
      transition={StarPanelMotionTransition}
      style={{ ...StarPanelStyle, ...styleOverride }}
      className={FONT_FAMILY.style.fontFamily}
    >
      {children}
    </motion.div>
  );
}
