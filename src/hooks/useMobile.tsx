"use client";

import { useEffect, useState } from "react";

// ============================================
// MOBILE SCALING CONFIGURATION
// ============================================
// Adjust these values to test different scaling factors
// 
// MOBILE_SCALE: For elements (constellations, stars, Polaris positions)
// - 1.0 = No scaling (same as desktop)
// - 0.65 = Recommended default (65% scale)
// - 0.5 = More aggressive scaling
// - 0.8 = Subtle scaling
//
// MOBILE_FONT_SCALE: For font sizes (can be different from element scaling)
// - 1.0 = No scaling (same as desktop)
// - 0.8 = Recommended default (80% scale - better readability)
// - 0.7 = More aggressive scaling
// ============================================
const DESKTOP_SCALE = 1.0;
const MOBILE_SCALE = 0.65;

const DESKTOP_FONT_SCALE = 1.0;
const MOBILE_FONT_SCALE = 0.4;

type MobileState = {
  isMobile: boolean;
  isMobileLandscape: boolean;
  isMobilePortrait: boolean;
  isSmallScreen: boolean;
  mobileScaleFactor: number;
  mobileFontScaleFactor: number;
};

export function useMobile(): MobileState {
  const [mobileState, setMobileState] = useState<MobileState>(() => {
    if (typeof window === "undefined") {
      return {
        isMobile: false,
        isMobileLandscape: false,
        isMobilePortrait: false,
        isSmallScreen: false,
        mobileScaleFactor: DESKTOP_SCALE,
        mobileFontScaleFactor: DESKTOP_FONT_SCALE,
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    // Detect mobile OR small landscape viewports (like tablet landscape, small laptop)
    const isMobile = width < 768;
    const isSmallLandscape = width < 1024 && width > height; // Small landscape viewport
    const isMobileLandscape = (isMobile || isSmallLandscape) && width > height;
    const isMobilePortrait = isMobile && height >= width;
    const isSmallScreen = width < 1600; // Custom breakpoint for small screens
    const mobileScaleFactor = isMobileLandscape ? MOBILE_SCALE : DESKTOP_SCALE;
    const mobileFontScaleFactor = isMobileLandscape ? MOBILE_FONT_SCALE : DESKTOP_FONT_SCALE;

    return {
      isMobile,
      isMobileLandscape,
      isMobilePortrait,
      isSmallScreen,
      mobileScaleFactor,
      mobileFontScaleFactor,
    };
  });

  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isMobile = width < 768;
      const isSmallLandscape = width < 1024 && width > height;
      const isMobileLandscape = (isMobile || isSmallLandscape) && width > height;
      const isMobilePortrait = isMobile && height >= width;
      const isSmallScreen = width < 1600; // Custom breakpoint for small screens
      const mobileScaleFactor = isMobileLandscape ? MOBILE_SCALE : DESKTOP_SCALE;
      const mobileFontScaleFactor = isMobileLandscape ? MOBILE_FONT_SCALE : DESKTOP_FONT_SCALE;

      setMobileState({
        isMobile,
        isMobileLandscape,
        isMobilePortrait,
        isSmallScreen,
        mobileScaleFactor,
        mobileFontScaleFactor,
      });
    };

    // Check on mount
    checkMobile();

    // Listen for resize and orientation changes
    window.addEventListener("resize", checkMobile);
    window.addEventListener("orientationchange", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("orientationchange", checkMobile);
    };
  }, []);

  return mobileState;
}
