"use client";

import { useEffect, useState } from "react";

type MobileState = {
  isMobile: boolean;
  isMobileLandscape: boolean;
  isMobilePortrait: boolean;
};

export function useMobile(): MobileState {
  const [mobileState, setMobileState] = useState<MobileState>(() => {
    if (typeof window === "undefined") {
      return {
        isMobile: false,
        isMobileLandscape: false,
        isMobilePortrait: false,
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    // Detect mobile OR small landscape viewports (like tablet landscape, small laptop)
    const isMobile = width < 768;
    const isSmallLandscape = width < 1024 && width > height; // Small landscape viewport
    const isMobileLandscape = (isMobile || isSmallLandscape) && width > height;
    const isMobilePortrait = isMobile && height >= width;

    return {
      isMobile,
      isMobileLandscape,
      isMobilePortrait,
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

      setMobileState({
        isMobile,
        isMobileLandscape,
        isMobilePortrait,
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
