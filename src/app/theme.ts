import { Josefin_Sans, Allura } from "next/font/google";

// ===========================
// FONTS
// ===========================
export const FONT_FAMILY = Josefin_Sans({ subsets: ["latin"] });
export const FANCY_FONT_FAMILY = Allura({ weight: "400", subsets: ["latin"] });

// ===========================
// BASE COLORS
// ===========================
export const SPACE_BACKGROUND_COLOR = "#0B0E13";
export const SPACE_TEXT_COLOR = "#F0F2F5";
export const SECONDARY_SPACE_COLOR = "#13161E";

// ===========================
// STAR COLORS
// ===========================
export const MAIN_STAR_COLORS = ["#FFFFFF", "#F5F8FF", "#FFFEF5", "#FFF5F8"];
export const BACKGROUND_STAR_COLORS = ["#888888", "#AAAAAA", "#CCCCCC", "#EEEEEE"];

// ===========================
// SEMANTIC COLORS
// ===========================
export const ERROR_COLOR = "#FF6464"; // For error states
export const ACCENT_COLOR = "#C8E6FF"; // Light blue accent
export const POLARIS_GLOW_COLOR = "rgba(200, 230, 255, 0.6)";

// ===========================
// OPACITY SCALE
// ===========================
export const OPACITY = {
  subtle: 0.03,
  light: 0.05,
  medium: 0.08,
  normal: 0.1,
  strong: 0.15,
  bold: 0.2,
  bolder: 0.3,
  semitransparent: 0.4,
  half: 0.5,
  solid: 1.0,
} as const;

// ===========================
// BORDER RADIUS SCALE
// ===========================
export const RADIUS = {
  sm: "5px",
  md: "8px",
  lg: "20px",
  pill: "99px",
  circle: "50%",
} as const;

// ===========================
// ANIMATION DURATIONS (in seconds)
// ===========================
export const DURATION = {
  fast: 0.2,
  normal: 0.42,
  slow: 0.5,
  intro: 1.0,
} as const;

// ===========================
// BLUR VALUES
// ===========================
export const BLUR = {
  light: "blur(4px)",
  medium: "blur(8px)",
  heavy: "blur(12px)",
} as const;

// ===========================
// GLASS/FROSTED EFFECTS
// ===========================
export const GLASS = {
  subtle: {
    background: `rgba(255, 255, 255, ${OPACITY.subtle})`,
    border: `1px solid rgba(255, 255, 255, ${OPACITY.normal})`,
    backdropFilter: BLUR.medium,
  },
  light: {
    background: `rgba(255, 255, 255, ${OPACITY.light})`,
    border: `1px solid rgba(255, 255, 255, ${OPACITY.normal})`,
    backdropFilter: BLUR.medium,
  },
  medium: {
    background: `rgba(255, 255, 255, ${OPACITY.medium})`,
    border: `1px solid rgba(255, 255, 255, ${OPACITY.normal})`,
    backdropFilter: BLUR.heavy,
  },
  strong: {
    background: `rgba(255, 255, 255, ${OPACITY.normal})`,
    border: `1px solid rgba(255, 255, 255, ${OPACITY.strong})`,
    backdropFilter: BLUR.heavy,
  },
  dark: {
    background: `rgba(0, 0, 0, ${OPACITY.half})`,
    border: `1px solid ${SPACE_TEXT_COLOR}`,
    backdropFilter: "none",
  },
} as const;

// ===========================
// SHADOWS
// ===========================
export const SHADOW = {
  sm: `0 2px 10px rgba(0, 0, 0, ${OPACITY.normal})`,
  md: `0 4px 20px rgba(0, 0, 0, ${OPACITY.normal})`,
  lg: `0 4px 30px rgba(0, 0, 0, ${OPACITY.normal})`,
} as const;

// ===========================
// TEXT OUTLINE
// ===========================
export const TEXT_OUTLINE = `
  -1px -1px 0 ${SPACE_BACKGROUND_COLOR},
  1px -1px 0 ${SPACE_BACKGROUND_COLOR},
  -1px 1px 0 ${SPACE_BACKGROUND_COLOR},
  1px 1px 0 ${SPACE_BACKGROUND_COLOR},
  0 -1px 0 ${SPACE_BACKGROUND_COLOR},
  0 1px 0 ${SPACE_BACKGROUND_COLOR},
  -1px 0 0 ${SPACE_BACKGROUND_COLOR},
  1px 0 0 ${SPACE_BACKGROUND_COLOR}
`;

// ===========================
// TYPOGRAPHY SCALE
// ===========================
export const TEXT_SIZE = {
  xs: "0.75rem",
  sm: "0.875rem",
  base: "1rem",
  lg: "1.125rem",
  xl: "1.25rem",
  "2xl": "1.5rem",
  "3xl": "2rem",
  "4xl": "3rem",
  "5xl": "4rem",
  "6xl": "5.5rem",
} as const;

// ===========================
// SPACING SCALE
// ===========================
export const SPACING = {
  xs: "0.25rem",
  sm: "0.5rem",
  md: "1rem",
  lg: "1.5rem",
  xl: "2rem",
  "2xl": "3rem",
  "3xl": "4rem",
} as const;

// ===========================
// PANEL DIMENSIONS
// ===========================
export const PANEL = {
  width: "50%",           // Width of the side panel
  padding: "2rem",        // Padding inside the panel
} as const;

// ===========================
// DESIGN REFERENCE DIMENSIONS
// ===========================
export const DESIGN_REFERENCE = {
  width: 2560,
  height: 1271,
} as const;

// ===========================
// FOCUS STYLES (Accessibility)
// ===========================
export const FOCUS_RING = {
  outline: `2px solid ${ACCENT_COLOR}`,
  outlineOffset: "2px",
} as const;

// ===========================
// HELPER FUNCTIONS
// ===========================

/**
 * Convert hex color to rgba with specified alpha
 * @param hex - Hex color string (e.g., "#FF0000")
 * @param alpha - Alpha value between 0 and 1
 * @returns rgba string
 */
export const hexToRgba = (hex: string, alpha: number): string => {
  // Remove the hash if it exists
  const cleanHex = hex.replace("#", "");

  // Parse the integers
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  // Return the rgba string
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * Get a random color from an array of colors
 * @param colors - Array of color strings
 * @returns Random color from the array
 */
export const getRandomColor = (colors: string[]): string => {
  return colors[Math.floor(Math.random() * colors.length)];
};
