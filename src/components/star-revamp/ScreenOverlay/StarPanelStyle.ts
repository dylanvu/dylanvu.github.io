import {
  hexToRgba,
  SECONDARY_SPACE_COLOR,
  SPACE_TEXT_COLOR,
} from "@/app/theme";

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
