import { Josefin_Sans, Allura } from "next/font/google";

export const SPACE_BACKGROUND_COLOR = "#0B0E13";
export const SPACE_TEXT_COLOR = "#F0F2F5";
export const SECONDARY_SPACE_COLOR = "#13161E";

export const FONT_FAMILY = Josefin_Sans({ subsets: ["latin"] });
export const FANCY_FONT_FAMILY = Allura({ weight: "400", subsets: ["latin"] });

export const hexToRgba = (hex: string, alpha: number) => {
  // Remove the hash if it exists
  const cleanHex = hex.replace("#", "");

  // Parse the integers
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  // Return the rgba string
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
