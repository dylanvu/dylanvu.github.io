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

export const StarPanelMotionAnimate: MotionInputs = {
  opacity: 1,
  x: 0,
};

export const StarPanelMotionExit:
  | TargetAndTransition
  | VariantLabels
  | undefined = {
  opacity: 0,
  x: 100,
};

export const StarPanelMotionTransition: Transition = {
  duration: 0.4,
  ease: "easeInOut",
};
